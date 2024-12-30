import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Dropdown,
  Form,
  ProgressBar,
  Row,
  Table,
} from "react-bootstrap";
import Carousel from "react-bootstrap/Carousel";
import { favoriteService } from "../../services/favoriteService";
import DayView from "../DayView/DayView";
import DetailsPane from "../DetailsPane/DetailsPane";
import {
 Trash
} from "react-bootstrap-icons";

const states = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "DC", label: "District Of Columbia" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

interface FormData {
  street: string;
  city: string;
  state: string;
  useLocation: boolean;
}
interface Suggestion {
  city: string;
  state: string;
  description: string;
}
interface DropdownState {
  isOpen: boolean;
}
interface Prediction {
  description: string;
}

interface Favorite {
  _id: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

const WeatherForm = () => {
  // form
  const [formData, setFormData] = useState<FormData>({
    street: "",
    city: "",
    state: "",
    useLocation: false,
  });
  const [errors, setErrors] = useState<{
    street?: string;
    city?: string;
    state?: string;
  }>({});
  const [activeButton, setActiveButton] = useState<"results" | "favorites">(
    "results"
  );
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dropdownState, setDropdownState] = useState<DropdownState>({
    isOpen: false,
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [disableSearch, setDisableSearch] = useState<boolean>(true);
  useEffect(() => {
    if(formData.state){
      setErrors(prev => ({...prev, state: ''}));
    }
      if(!formData.useLocation){
        if((!formData.street || !formData.city || !formData.state || !states.map((_) => _.label).includes(formData.state))){
          setDisableSearch(true);
        }
        else{
          setDisableSearch(false);
        }
      }
      else{
        setDisableSearch(false);
      }
     
  }, [formData]);

  //form data
  const [weatherLocation, setWeatherLocation] = useState<{
    city: string;
    state: string;
  }>({ city: "", state: "" });
  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);

//weather data and loading
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // All details pane data
  const [detailsData, setDetailsData] = useState<any | null>(null);

  // carousel setup
  const [carouselIndex, setCarouselIndex] = useState(0);
  const handleSetCarouselIndex = (selectedIndex: number) => {
    setCarouselIndex(selectedIndex);
  };

  // favorites data
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [apiError, setApiError] = useState(false);

  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  const validateFields = () => {
    const newErrors: { street?: string; city?: string; state?: string } = {};
    if (!formData.street && !formData.useLocation)
      newErrors.street = "Street is required.";
    if (!formData.city && !formData.useLocation)
      newErrors.city = "City is required.";
    if (!formData.state && !formData.useLocation)
      newErrors.state = "State is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmpty = (field: string) => {
    const newErrors = { ...errors };
    if (!formData[field as keyof FormData] && !formData.useLocation) {
      newErrors[field as keyof typeof errors] = `Please enter a valid ${field}`;
    } else {
      delete newErrors[field as keyof typeof errors];
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateFields()) {
      setIsLoading(true);
      setActiveButton("results");
      await fetchWeather();
      setIsLoading(false);
      setSelectedRow(null);
    }
  };

  const handleClear = () => {
    setFormData({
      street: "",
      city: "",
      state: "",
      useLocation: false,
    });
    setErrors({});
    setWeatherLocation({ city: "", state: "" });
    setWeatherData(null);
    setCarouselIndex(0);
  setDetailsData(null);
  setApiError(false);
  setActiveButton("results");
  };

  const handleCheckboxChange = () => {
    setFormData((prev) => ({
      ...prev,
      useLocation: !prev.useLocation
    }));
  
    // When checkbox or useLocation is checked, then retrieve location based on IP info and populate all fields
    if (!formData.useLocation) {
      getLocationByIPInfo().then((location) => {
        setFormData((prev) => ({
          ...prev,
          street:prev.street,
          city:  prev.city,
          state:  prev.state
        }));
      });
    }
  };

  const handleResultsClick = () => {
    setActiveButton("results");
    setCarouselIndex(0); 
  };

  const handleFavoritesClick = () => {
    setActiveButton("favorites");
    fetchFavorites();
  };

 

const handleFavoriteRowClick = async (city: string, state: string) => {
  setActiveButton("results");
  setCarouselIndex(0); 
  setIsLoading(true);
  setSelectedRow(null);

  try {
  
    const { lat, lon } = await getLocationByAddress(city, state);
    await fetchWeatherData(lat, lon, false);
    setWeatherLocation({ city, state });
  } catch (error) {
    console.error("Error fetching weather for favorite:", error);
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchFavorites();
}, []); 


  const fetchAutocompleteSuggestions = async (input: string) => {
    try {
      const response = await fetch(
        // ` http://localhost:5001/autocomplete?input=${input}`
        `https://weatherappbackend-441501.uw.r.appspot.com/autocomplete?input=${input}`
      );
      const data = await response.json();
      
 
      const formattedSuggestions = data.predictions.map((prediction: Prediction) => {
        const [city, state] = prediction.description.split(",");
        return {
          ...prediction,
          city: city.trim(),
          state: state ? state.trim() : "",
        };
      });
  
      setSuggestions(formattedSuggestions || []);
      setDropdownState({ isOpen: true });
      // setDisableSearch(false);
  
    } catch (error) {
      console.error("Error fetching autocomplete suggestions:", error);
      setSuggestions([]);
    }
  };


  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, city: value });
    setShowCityDropdown(true);
  
    if (value.length > 0) {
      fetchAutocompleteSuggestions(value);
    } else {
      setSuggestions([]);
      setDropdownState({ isOpen: false });
    }
  };

  const handleSuggestionSelect = (suggestion: { city: string, state: string }) => {
    setFormData({ ...formData, city: suggestion.city, state: states.find(_ => _.value == suggestion.state)?.label });
    setSuggestions([]);
    setDropdownState({ isOpen: false });
    console.log("city chnage", suggestion.city, suggestion.state );
  };
 

  const fetchWeatherData = async (lat: string, lon: string, loc: boolean) => {
    const params = new URLSearchParams({
      lat,
      lon,
      street: formData.street,
      city: formData.city,
      state: formData.state,
      loc: loc.toString(),
    });
    const response = await fetch(
      // `http://localhost:5001/weather?${params.toString()}`,
      `https://weatherappbackend-441501.uw.r.appspot.com/weather?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data.");
    }

    const data = await response.json();
    setWeatherData(data);
    setLatitude(lat);
    setLongitude(lon);
  };

  const getLocationByIPInfo = async () => {
    const ipinfoToken = "8e9152548058e9";
    const response = await fetch(`https://ipinfo.io/?token=${ipinfoToken}`);

    if (!response.ok) {
      throw new Error("Unable to fetch location from IPInfo.");
    }

    const data = await response.json();

    const [lat, lon] = data.loc.split(",");
    const city = data.city;
    const state = data.region;

    return { lat, lon, city, state };
  };

  const getLocationByAddress = async (city: string, state: string) => {
    const googleApiKey = "AIzaSyB32ZyEKGCtbQ3ljMmb_ieZdMZhBXHZ8IA";
    const address = `${city}, ${state}`;
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${googleApiKey}`;
  
    const response = await fetch(geocodeUrl);
  
    if (!response.ok) {
      throw new Error("Geocoding failed. Check your address.");
    }
  
    const data = await response.json();
  
    if (data.status !== "OK") {
      throw new Error("Geocoding failed. Check your address.");
    }
  
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lon: lng, city, state };
  };
  

  const fetchWeather = async () => {
    try {
      setApiError(false);
      let weatherLocationData = { city: "", state: "" };

      if (formData.useLocation) {
        const { lat, lon, city, state } = await getLocationByIPInfo();
        await fetchWeatherData(lat, lon, formData.useLocation);
        weatherLocationData = { city, state };
      } else {
        if (!formData.street || !formData.city || !formData.state) {
          alert("Please provide a valid street, city, and state.");
          return;
        }

        const { lat, lon, city, state } = await getLocationByAddress(formData.city, formData.state);
        console.log(formData.useLocation, "useloc");
        await fetchWeatherData(lat, lon, formData.useLocation);
        weatherLocationData = { city, state: state };
      }

      setWeatherLocation(weatherLocationData);
    } catch (err: unknown) {
      setApiError(true);
      setWeatherData(null);


      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("An unknown error occurred:", err);
      }
    }
  };

  const fetchFavorites = async () => {
    try {
      const favorites = await favoriteService.getFavorites();
      setFavorites(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const addFavorite = async (city: string, state: string) => {
    try {
      await favoriteService.addFavorite({ city, state });
      fetchFavorites();
    } catch (error) {
      console.error("Error adding favorite:", error);
    }
  };

  const deleteFavorite = async (id: string) => {
    try {
      await favoriteService.removeFavorite(id);
      fetchFavorites();
    } catch (error) {
      console.error("Error deleting favorite:", error);
    }
  };
 const [filteredStates, setFilteredStates] = useState(states);
  const [showDropdown, setShowDropdown] = useState(false);
  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    console.log(inputValue);
    setFormData({ ...formData, state: inputValue });
    setShowDropdown(true);

   
    const filtered = states.filter((state) =>
      state.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredStates(filtered);
  
  };

  const handleStateSelect = (state: { value: string; label: string }) => {
    setFormData({ ...formData, state: state.label });
    setShowStateDropdown(false);
  handleEmpty("state");
  // setDisableSearch(false);

    console.log("state", state);
  };

  // City should autocomplete state field as well 
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // State dropdown reference and state
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const stateDropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
      if (stateDropdownRef.current && !stateDropdownRef.current.contains(event.target as Node)) {
        setShowStateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="container">
      <Card className="p-4" style={{ backgroundColor: 'rgba(33, 37, 41, 0.03)' }}>
        <Card.Header className="text-center">
          <h2>Weather Search 🌥️</h2>
        </Card.Header>
        <Card.Body>
          <div className="d-flex justify-content-center">
            <Form onSubmit={handleSubmit} className="w-100">
              {/* Street Field code */}
              <Row className="mb-1">
                <Col md={3}>
                  <Form.Label>
                    Street <span className="text-danger"> *</span>
                  </Form.Label>
                </Col>
                <Col md={9}>
                  <Form.Control
                    type="text"
                    placeholder=""
                    value={formData.street}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        street: e.target.value,
                      })
                    }
                    onBlur={() => handleEmpty("street")}
                    disabled={formData.useLocation}
                    isInvalid={!!errors.street}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.street}
                  </Form.Control.Feedback>
                </Col>
              </Row>

              {/* City Field code */}
              <Row className="mb-1">
                <Col md={3}>
                  <Form.Label>
                    City <span className="text-danger"> *</span>{" "}
                  </Form.Label>
                </Col>
                <Col md={9}>
                  <div className="position-relative" ref={cityDropdownRef}>
                    <Form.Control
                      type="text"
                      placeholder=""
                      value={formData.city}
                      onChange={handleCityChange}
                      onBlur={() => handleEmpty("city")}
                      disabled={formData.useLocation}
                      isInvalid={!!errors.city}
                      required
                      onClick={() => setShowCityDropdown(true)}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.city}
                    </Form.Control.Feedback>
                    {showCityDropdown && dropdownState.isOpen && suggestions.length > 0 && (
                      <Dropdown.Menu
                        show
                        style={{
                          width: "100%",
                          maxHeight: "200px",
                          overflowY: "auto",
                        }}
                      >
                        {suggestions.map((suggestion, index) => (
  <Dropdown.Item
    key={index}
    onClick={() => handleSuggestionSelect({ city: suggestion.city, state: suggestion.state })}
    className="text-truncate"
  >
    {suggestion.city}
  </Dropdown.Item>
))}
                      </Dropdown.Menu>
                    )}
                  </div>
                </Col>
              </Row>

              {/* State Field code */}
              <Row className="mb-1">
              
                <Col md={3}>
                  <Form.Label>
                    State <span className="text-danger"> *</span>{" "}
                  </Form.Label>
                </Col>
                <Col md={9}>
                  <div className="position-relative w-50" ref={stateDropdownRef}> 
                  <Form.Control
          type="text"
          placeholder="Select or type a state"
          value={formData.state}
          onChange={handleStateChange}
          onClick={() => setShowStateDropdown(true)}
          onBlur={() => handleEmpty("state")}
          isInvalid={!!errors.state}
          disabled={formData.useLocation}
          required
          
        />
        {showStateDropdown && (
          <Dropdown.Menu show className="w-100 position-absolute"> 
          {/* //referred chat gpt */}
            {filteredStates.length > 0 ? (
              filteredStates.map((state) => (
                <Dropdown.Item
                  key={state.value}
                  onClick={() => handleStateSelect(state)}
                >
                  {state.label}
                </Dropdown.Item>
              ))
            ) : (
              <Dropdown.Item disabled>No results found</Dropdown.Item>
            )}
             {/* //referred chat gpt */}
          </Dropdown.Menu>
        )}
      
      {/* </Form.Group> */}

                  <Form.Control.Feedback type="invalid">
                    {errors.state}
                  </Form.Control.Feedback>
                  </div>
                </Col>
              </Row>
             
        
<hr></hr>
              {/* Location Checkbox  code */}
              <Row className="mb-3 mt-2">
                <Col md={12} className="d-flex justify-content-center">
                  <Form.Group className="d-flex align-items-center flex-nowrap">
                    <Form.Label className="ms-3 me-2 flex-nowrap text-nowrap min-w-auto">
                      Autodetect Location
                      <span className="text-danger"> *</span>
                    </Form.Label>
                    <Form.Check
                      type="checkbox"
                      label="Current Location"
                      checked={formData.useLocation}
                      onChange={handleCheckboxChange}
                      className="text-nowrap"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Buttons  search and clear code */}
              <div className="d-flex justify-content-center">
                <Button
                  variant="primary"
                  type="submit"
                  className="me-3"
                  disabled={
                    disableSearch
                  }
                >
                  Search
                </Button>
                <Button
                  variant="outline-secondary"
                  type="button"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </div>
            </Form>
          </div>
        </Card.Body>
      </Card>
      {/* Results and Favorites Buttons code  */}
      <div className="d-flex justify-content-center mt-2">
        <Button
    variant={activeButton === "results" ? "primary" : "outline-primary"}
    className={`me-3 ${activeButton !== "results" ? "border-0" : ""}`}
    onClick={handleResultsClick}
  >
    Results
  </Button>

<Button
  variant={activeButton === "favorites" ? "primary" : "link"}
  className={`text-${activeButton === "favorites" ? "white" : "primary"} ${
    activeButton !== "favorites" ? "border-0 text-decoration-none" : ""
  }`}
  onClick={handleFavoritesClick}
>
  Favorites
</Button>
      </div>
      {/*  Error Message code */}
      {activeButton === "results" && apiError && (
        <Alert variant="danger" className="mt-3">
          An error occurred please try again
        </Alert>
      )}

      {activeButton === "results" && weatherData && (
        <Carousel
          activeIndex={carouselIndex}
          onSelect={handleSetCarouselIndex}
          indicators={false}
          controls={false}
          interval={null}
        >
          <Carousel.Item>
            <DayView
              weatherData={weatherData}
              location={{
                city: weatherLocation.city,
                state: weatherLocation.state,
              }}
              latitude={latitude}
              longitude={longitude}
              setCarouselIndex={handleSetCarouselIndex}
              setDetailsData={setDetailsData}
              favorite={favorites.find(
                (favorite) =>
                  favorite.city === weatherLocation.city &&
                  favorite.state === weatherLocation.state
              )}
              addFavorite={addFavorite}
              deleteFavorite={deleteFavorite}
              selectedRow={selectedRow}
  setSelectedRow={setSelectedRow}

            />
          </Carousel.Item>
          <Carousel.Item>
            {detailsData && (
              <DetailsPane
                details={detailsData}
                lat={latitude}
                lon={longitude}
                setCarouselIndex={handleSetCarouselIndex}
              />
            )}
          </Carousel.Item>
        </Carousel>
      )}

{/* // Then update your favorites table */}
{activeButton === "favorites" && (
        <>
          {favorites.length > 0 ? (
  <Table responsive hover>
    <thead>
      <tr>
        <th>#</th>
        <th>City</th>
        <th>State</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {favorites.map((favorite, index) => (
        <tr key={favorite._id}>
          <td 
            onClick={() => handleFavoriteRowClick(favorite.city, favorite.state)}
            style={{ cursor: 'pointer' }}
          >
            {index + 1}
          </td>
          <td 
            onClick={() => handleFavoriteRowClick(favorite.city, favorite.state)}
            style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
          >
            {favorite.city}
          </td>
          <td 
            onClick={() => handleFavoriteRowClick(favorite.city, favorite.state)}
            style={{ cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
          >
            {favorite.state}
          </td>
          <td>
            <Button
              variant="link"
              style={{
                color: "black",
                height: "auto",
                padding: "0",
                margin: "0",
              }}
              onClick={(e) => {
                e.stopPropagation();
                deleteFavorite(favorite._id);
              }}
            >
              <Trash/>
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </Table> ) : (
            <Alert variant="warning" className="mt-3">
              Sorry! No records found.
            </Alert>
          )}
        </>
)}

      {/*  progress bar code during loading */}
      {isLoading && (
        <ProgressBar animated now={100} label="Loading..." className="mt-3" />
      )}
    </div>
  );
};

export default WeatherForm;
