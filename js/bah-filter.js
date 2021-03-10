(function() {
  'use strict';

  Polymer({

    is: 'bah-filter',

    properties: {
    /**
     * Private property to track the displayed items in the checkbox groups.
     * We use this to help track changes before the filter is applied
     */
      _displayItems: {
        type: Array
      },
      /**
       * Filter items for the checkbox groups
       * Filter item objects specs:
       *  {
       *    name: 'Alert Statuses',
       *    showSearch: true,
       *    singleSearch: true,
       *    maintainOrderForItems: false,
       *     items: [{
       *         key: 'Dummy Key',
       *         val: 'Dummy Value',
       *         selected: false
       *     }]
       *   }
       */
      filterItems: {
        type: Array,
        notify: true,
        observer: '_handleFilterItemsChange'
      },
      /**
       * The items that were selected by user for the filter
       */
      _selectedItems: {
        type: Array
      },
      /**
       * Determines whether or not to show the filter component. This is bounded to the
       * parent wrapper component's showFilter property, and notifies when changed
       */
      showFilter: {
        type: Boolean,
        notify: true
      },

      /**
       * Determines whether or not to show the free form filter
       */
      showTextSearch: {
        type: Object,
        value: false
      },

      showDateSearch: {
        type: Object,
        value: false
      },

      /**
       * The free-form text entered into the search bar
       */
      searchText: {
        type: String,
        notify: true,
        observer: '_textChanged'
      },

      /**
       * The Moment.js datetime objects that represent the time range selected
       * in the px-datetime-range componenet
       */
      timeRange: {
        type: Object,
        notify: true
      },
      /**
      * Cookie variable used for filter items
      */
      bahFilterCookie: {
        value: "bahFilterCookie="
      },
    },

    listeners: {
      'px-datetime-range-submitted': '_dateChanged'
    },

    /**
     * Cancels the changes made by the user by reseting it back to is
     * original state
     */
    cancelChanges: function() {
      this._resetDisplayedItems(this.filterItems);
      this.showFilter = false;
    },

    /**
     * Clears all filters selected by the user by setting selected
     * property to false
     */
    clearFilters: function() {
      var _this = this;
      var clearedFilters;
      var tmpFilterItems = _this._displayItems;

      // set all selected to false
      _.forEach(tmpFilterItems, function(filterItem) {
        clearedFilters = _.forEach(filterItem.items, function(item) {
          item.selected = false;
        });
        filterItem.items = clearedFilters;
      });
      this._resetDisplayedItems(tmpFilterItems);
    },

    /**
     * When the filter button is applied, set the selected items,
     * then set the filter items to the new values.
     */
    filterApplied: function() {
      // this._setSelectedItems();
      this._setFilterItems();
      this.showFilter = false;
    },

    /**
     * When the filter items are changed, set display items to match it.
     * Then sset selected items before firing an event
     * Event data specs (e.detail): **{filterItems: [Objects of all items with actual value],
     * selectedItems: [Objects of items which are only selected]}**
     * @event bah-filter-changed
     */
    _handleFilterItemsChange: function() {
      this._setDisplayItems();
      this._setSelectedItems();
      var filterObj = {
        filterItems: this._displayItems,
        selectedItems: this._selectedItems
      };

      this.fire('bah-filter-changed', filterObj);
      this._cacheFilterItems(filterObj);
    },

    /**
     * Caches all active filters and passes changes down to the bah-filter component through
     * data binding. The data binding should then fire an event to the implementer of the component
     */
    _cacheFilterItems: function _cacheFilterItems(filterObj){
      try {
        localStorage.setItem('filters', JSON.stringify(filterObj));
      } catch(e) {
        console.error('Could not save filter to localStorage', e);
      }
    },

    /**
     * Reset displayed items to the filter items given
     * @param {Array} items - the array of filter items to reset to
     */
    _resetDisplayedItems: function(items) {
      var _this = this;
      // make changes observeable
      this.set('_displayItems', []);

      // debounce to let polymer events catch up
      // adding a time here makes the redraw noticable,
      // using default works fine
      this.debounce('resetting-checkboxes', function() {
        _this.set('_displayItems', _.cloneDeep(items));
      });
    },

    /**
     * Sets the display items to a deep copy of filter items
     */
    _setDisplayItems: function() {
      this._displayItems = _.cloneDeep(this.filterItems);
    },

    /**
     * Sets the filter items to a deep copy of display items
     */
    _setFilterItems: function() {
      this.filterItems = _.cloneDeep(this._displayItems);
    },

    /**
     * Sets the selected items array.
     * For each filter item, it retrieves selected items from its items property,
     * then pushes that filter item with only the selected items
     * selected items.
     */
    _setSelectedItems: function() {
      this._selectedItems = [];
      var displayItemsCopy = _.cloneDeep(this._displayItems);
      var _this = this;

      // loop through the filter items data to get
      // only the selected items in each array index
      _.forEach(displayItemsCopy, function(filterItem) {
        var selected = _.filter(filterItem.items, function(item) {
          return item.selected;
        });
        if (selected.length > 0) {
          filterItem.items = selected;
          _this._selectedItems.push(filterItem);
        }
      });
      this._selectedItems = _.flatten(_this._selectedItems);
    },

    /**
     * Called when px-daterange-picker is changed.
     * Fires 'bah-filter-date-changed' event with new values.
     */
    _dateChanged: function() {
      var _this = this;
      _this.fire('bah-filter-date-changed', {
        timeRange: _this.timeRange
      });
    },

    /**
     * Called when text is changed in free text search field.
     * Fires 'bah-filter-text-changed' event with new value.
     */
    _textChanged: function() {
      var _this = this;
      _this.fire('bah-filter-text-changed', {
        searchText: _this.searchText
      });
    },

    /**
     * Indicates if the text search box or the date range elements
     * are active, and returns true. Used to display a new column
     * for these components to be placed in.
     */
    _textOrDateSearchActive: function (textActive, dateActive) {
      return textActive || dateActive;
    }
  });
}());
