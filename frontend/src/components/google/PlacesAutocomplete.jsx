import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import { getAutocompleteSuggestions, getPlaceDetails, extractBusinessData, formatPhoneNumber } from '../../services/googlePlaces';

/**
 * Google Places Autocomplete Component
 * Provides address autocomplete and auto-fills business form data
 * Uses backend API proxy to keep API key secure
 */
const PlacesAutocomplete = ({ 
  value, 
  onChange, 
  onPlaceSelect, 
  placeholder = "Search for your business address...",
  className = "",
  error = null,
  disabled = false,
}) => {
  const inputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showClearButton, setShowClearButton] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimeoutRef = useRef(null);
  const containerRef = useRef(null);

  // Debounced search for autocomplete
  useEffect(() => {
    const handleInput = async (inputValue) => {
      if (!inputValue || inputValue.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const predictions = await getAutocompleteSuggestions(inputValue.trim());
        
        setSuggestions(predictions);
        setShowSuggestions(predictions.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        
        // Show helpful error message
        let errorMsg = error.message || 'Failed to load suggestions. Please try again.';
        
        // If it's a REQUEST_DENIED error, show more helpful message
        if (errorMsg.includes('REQUEST_DENIED') || errorMsg.includes('request denied')) {
          errorMsg = 'Google Places API is not configured. Please check backend .env file for GOOGLE_PLACES_API_KEY.';
        }
        
        setErrorMessage(errorMsg);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce the search (wait 300ms after user stops typing)
    debounceTimeoutRef.current = setTimeout(() => {
      if (inputRef.current) {
        handleInput(inputRef.current.value);
      }
    }, 300);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [value]);

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    if (onChange) {
      onChange({
        target: {
          name: 'address',
          value: newValue,
        },
      });
    }

    setShowClearButton(!!newValue);
    setShowSuggestions(false);
  };

  // Handle place selection
  const handleSelectPlace = async (prediction) => {
    if (!prediction.place_id) {
      setErrorMessage('Invalid place selected');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      setShowSuggestions(false);

      // Get detailed place information
      const placeDetails = await getPlaceDetails(prediction.place_id);
      
      // Extract business data
      const businessData = extractBusinessData(placeDetails);

      // Update the input value
      if (onChange) {
        onChange({
          target: {
            name: 'address',
            value: businessData.address,
          },
        });
      }

      // Callback with extracted data
      if (onPlaceSelect) {
        onPlaceSelect(businessData);
      }

      setShowClearButton(true);
      setSuggestions([]);
    } catch (error) {
      console.error('Error fetching place details:', error);
      setErrorMessage('Failed to load place details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectPlace(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          handleSelectPlace(suggestions[0]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update input value when prop changes
  useEffect(() => {
    if (inputRef.current && value !== undefined) {
      inputRef.current.value = value || '';
      setShowClearButton(!!value);
    }
  }, [value]);

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
      setShowClearButton(false);
      setShowSuggestions(false);
      setSuggestions([]);
      
      if (onChange) {
        onChange({
          target: {
            name: 'address',
            value: '',
          },
        });
      }

      if (onPlaceSelect) {
        onPlaceSelect(null);
      }
    }
  };

  const displayError = error || errorMessage;

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          ) : (
            <MapPin className="w-5 h-5 text-gray-400" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          name="address"
          value={value || ''}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full pl-10 pr-10 py-3 border-2 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${displayError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'}
            ${className}
          `}
        />

        {showClearButton && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10
                     p-1 text-gray-400 hover:text-gray-600 rounded-full
                     hover:bg-gray-100 transition-colors"
            aria-label="Clear address"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((prediction, index) => (
            <button
              key={prediction.place_id}
              type="button"
              onClick={() => handleSelectPlace(prediction)}
              className={`
                w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors
                ${index === selectedIndex ? 'bg-blue-100' : ''}
                ${index === 0 ? 'rounded-t-xl' : ''}
                ${index === suggestions.length - 1 ? 'rounded-b-xl' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {(() => {
                      const mainText = prediction.structured_formatting?.main_text || prediction.description;
                      return typeof mainText === 'string' ? mainText : (mainText?.text || '');
                    })()}
                  </p>
                  {(() => {
                    const secondaryText = prediction.structured_formatting?.secondary_text;
                    if (!secondaryText) return null;
                    const text = typeof secondaryText === 'string' ? secondaryText : (secondaryText?.text || '');
                    return text ? (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {text}
                      </p>
                    ) : null;
                  })()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {displayError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium flex items-center gap-2 mb-1">
            <span>⚠️</span>
            <span>Error: {displayError}</span>
          </p>
          {displayError.includes('not configured') && (
            <p className="text-xs text-red-700 mt-2">
              <strong>Fix:</strong> Add <code className="bg-red-100 px-1 rounded">GOOGLE_PLACES_API_KEY=your_key</code> to <code className="bg-red-100 px-1 rounded">backend/.env</code> and restart the backend server.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PlacesAutocomplete;
