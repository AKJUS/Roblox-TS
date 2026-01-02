import PropTypes from "prop-types";

function UniverseSearchIcon({ toggleUniverseSearch }) {
  return (
    <li className="rbx-navbar-right-search">
      {/* TODO: old, migrated code. */}
      {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
      <button
        type="button"
        className="rbx-menu-item btn-navigation-nav-search-white-md"
        onClick={toggleUniverseSearch}
      >
        <span className="icon-nav-search-white" />
      </button>
    </li>
  );
}

UniverseSearchIcon.propTypes = {
  toggleUniverseSearch: PropTypes.func.isRequired,
};
export default UniverseSearchIcon;
