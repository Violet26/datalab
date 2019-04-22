// import libraries
import React, { Component } from "react";
import Autosuggest from "react-autosuggest";
import AutosuggestHighlightMatch from "autosuggest-highlight/match";
import AutosuggestHighlightParse from "autosuggest-highlight/parse";

class SunburstSearchbar extends Component {
  escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  getSuggestions(value) {
    const escapedValue = this.escapeRegexCharacters(value.trim());
    if (escapedValue === "") return [];
    
    // find escaped value anywhere in value
    // ignore case
    const regex = new RegExp(`${escapedValue}`, "i");

    return this.props.staticData.unfilteredSearchbarSuggestions.filter(e => regex.test(e));
  }

  getSuggestionValue(suggestion) {
    return suggestion;
  }

  renderSuggestion(suggestion, { query }) {
    const matches = AutosuggestHighlightMatch(suggestion, query);
    const parts = AutosuggestHighlightParse(suggestion, matches);

    return (
      <span>
        {parts.map((part, index) => {
          const className = part.highlight
            ? "react-autosuggest__suggestion-match"
            : null;

          return (
            <span className={className} key={index}>
              {part.text}
            </span>
          );
        })}
      </span>
    );
  }

  onChange = (event, { newValue, method }) => {
    const { handleSearchbarSelect, handleSearchbarTextChange } = this.props;

    switch (method) {
      case "type":
        handleSearchbarTextChange(newValue);
        break;
      case "click":
        handleSearchbarSelect(newValue);
        break;
      case "enter":
        handleSearchbarSelect(newValue);
        break;
      default:
        console.log(`no action has been specified for this action: ${method}`);
    }
  };

  onSuggestionsFetchRequested = ({ value }) => {
    const { setSearchbarSuggestions } = this.props;
    setSearchbarSuggestions(this.getSuggestions(value));
  };

  onSuggestionsClearRequested = () => {};

  render() {

    const {
      searchbarText,
      searchbarSuggestions,
      handleSearchbarOptionChange
    } = this.props;

    const inputProps = {
      placeholder: 'Search Contracts and Agencies',
      value: searchbarText,
      onChange: this.onChange
    };

    return (
      <div className="controls">
        <div className="controls-row">
          <Autosuggest
            className="searchbar"
            suggestions={searchbarSuggestions.slice(0, 20)}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={this.getSuggestionValue}
            renderSuggestion={this.renderSuggestion}
            inputProps={inputProps}
          />
          <button onClick={this.props.clearSunburstFilters} className="clear-button">X</button>
        </div>
      </div>
    );
  }
}

export default SunburstSearchbar;
