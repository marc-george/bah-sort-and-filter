(function() {
  'use strict';

  Polymer({
    is: 'bah-sort-and-filter',

    listeners: {
      'bah-filter-changed': 'handleFilterChange'
    },

    properties: {
      /**
       * Display string for Detailed View
       */
      detailedView: {
        type: String,
        value: 'Detailed View'
      },

      /**
       * Display Icon for Detailed View
       */
      detailedViewIcon: {
        type: String,
        value: 'fa:fa-th'
      },

      /**
       * Display string for Summary View
       */
      summaryView: {
        type: String,
        value: 'Summary View'
      },

      /**
       * Cookie used for sort selection
       */
      bahSortCookie: {
        value: 'bahSortCookie='
      },

      /**
       * Cookie variable used for filter items
       */
      bahFilterCookie: {
        value: 'bahFilterCookie='
      },
      /**
       * Cookie variable used for filter items
       */
      bahViewCookie: {
        value: 'bahViewCookie='
      },

      /**
       * Display Icon for Summary View
       */
      summaryViewIcon: {
        type: String,
        value: 'fa:fa-th-list'
      },

      /**
       * The Array of filter items passed into the component, then passed to bah-filter
       * Filter item objects specs:
       *  **{
       *    name: 'Alert Statuses',
       *    showSearch: true,
       *    singleSelection: true,
       *    maintainOrderForItems: false,
       *     items: [{
       *         key: 'Dummy Key',
       *         val: 'Dummy Value',
       *         selected: false
       *     }]
       *   }**
       */
      filterItems: {
        type: Array
      },

      /**
       * Selected items to show for the active filters div.
       */
      _selectedItems: {
        type: Array,
        value: []
      },

      /**
       * The selected value from the sort options
       */
      _selectedSortValue: {
        type: String,
        computed: 'computeSelectedSortValue(sortOptions)'
      },

      /**
       * The user's selected view from the action bar
       * Initial value should be same as detailed view
       */
      selectedView: {
        type: String,
        value: 'Detailed View'
      },

      /**
       * Icon for user's selected view
       */
      selectedViewIcon: {
        type: String,
        value: 'fa:fa-th'
      },

      /**
       * Determines whether the "Filtering by" and "Clear filters" text
       * is displayed on the active filters div
       */
      _showActiveFilterLabels: {
        type: Boolean,
        value: false
      },

      /**
       * Determines whether or not to show sort options
       */
      _showSortOptions: {
        type: Boolean,
        observer: 'handleShowSortOptionsChange',
        value: false
      },

      /**
       * The sort options for the dropdown.
       * Array specs:
       * **[
       *     {
       *       "key": "1",
       *       "val": "Newest First",
       *       "selected": false
       *     }
       * ]**
       */
      sortOptions: {
        type: Array
      },

      /**
       * Determines if the component should show the bah-filter component
       */
      _showFilters: {
        type: Boolean,
        observer: 'handleShowFiltersChange',
        value: false
      },

      /**
       * Determines if the free form search should show in bah-filter component. This property
       * passes through to the bah-filter.
       */
      showTextSearch: {
        type: Object,
        value: false
      },

      /**
       * Determines if the date search should show in the bah-filter componenet. This
       * property passes through to the bah-filter.
       */
      showDateSearch: {
        type: Object,
        value: false
      },

      /**
       * Determines if the detailed / summary view selection button displays.
       */
      showViewToggleButton: {
        type: Boolean,
        value: true
      },

      showSortOptionsInHeader: {
        type: Boolean,
        value: true
      }
    },

    ready: function ready() {
      let _this = this;
      _this.async(
        function() {
          _this.showSortOptionsInHeader && _this.showViewToggleButton
            ? _this.$$('#viewToggleBtn').classList.add('col-md-offset-5', 'col-sm-offset-5')
            : _this.showViewToggleButton
            ? _this.$$('#viewToggleBtn').classList.add('col-md-offset-8', 'col-sm-offset-8')
            : '';
          _this._getCachedSortAndFilterValues();
        }.bind(_this),
        1000
      );
    },

    _getCachedSortAndFilterValues: function() {
      var cachedSortValue;
      var cachedFilterValues;
      var cachedView;

      try { cachedSortValue = JSON.parse(localStorage.getItem('sorter')); } catch (e) {}
      try { cachedFilterValues = JSON.parse(localStorage.getItem('filters')); } catch (e) {}
      try { cachedView = JSON.parse(localStorage.getItem('selectedView')); } catch (e) {}

      this._setAllCachedValues(cachedSortValue, cachedFilterValues, cachedView);
    },

    _setAllCachedValues: function setAllCachedValues(sortValue, filterValues, view) {
      var _this = this;
      _this.debounce('rendering', function() {
        _this._setSelectedViewFromCache(view);
        _this._setSelectedFilterValues(filterValues);
        _this._setSelectedSortValue(sortValue);
      });
    },

    /*
     * Sets the selected sort option to parameter passed
     */
    _setSelectedSortValue: function(sortObj) {
      if (sortObj) {
        // set all values to false if not cached sort value
        for (var i = 0; i < this.sortOptions.length; i++) {
          if (this.sortOptions[i].key === sortObj.key) {
            this.sortOptions[i].selected = true;
          } else {
            this.sortOptions[i].selected = false;
          }
        }
        this.sortOptions = _.sortBy(this.sortOptions, function(o) {
          return !o.selected;
        });
        this.fire('bah-sort-changed', sortObj);
      }
    },

    _setSelectedFilterValues: function(filterObj) {
      if (filterObj) {
        this.fire('bah-filter-changed', filterObj);
      }
    },

    clearActiveFilter: function(e) {
      var _this = this;
      var modelData = e.model.__data__;
      var tmpFilterItems = _.cloneDeep(_this.filterItems);

      var filterItemIndex = _.findIndex(tmpFilterItems, {name: modelData.item.filterItemName});
      var itemIndex = _.findIndex(tmpFilterItems[filterItemIndex].items, {
        val: modelData.item.val
      });
      tmpFilterItems[filterItemIndex].items[itemIndex].selected = false;
      this.debounce('rendering', function() {
        _this.set('filterItems', tmpFilterItems);
      });
    },

    /**
     * Determine whether we should show the sort options on click of action text
     * Set show filter to false to cover ourselves from unwanted state
     */
    _toggleSortOptions: function _showSortOptions() {
      this._showFilters = false;
      this._showSortOptions = !this._showSortOptions;
    },

    /**
     * Clears the all active filters and passes changes down to the bah-filter component through
     * data binding. The data binding should then fire an event to the implementer of the component
     */
    clearAllActiveFilters: function() {
      var _this = this;
      var clearedFilters;
      var tmpFilterItems = JSON.parse(JSON.stringify(_this.filterItems));
      _.forEach(tmpFilterItems, function(filterItem) {
        clearedFilters = _.forEach(filterItem.items, function(item) {
          item.selected = false;
        });
        filterItem.items = clearedFilters;
      });

      _this.set('filterItems', tmpFilterItems);
      _this.set('_selectedItems', []);
      var filterObj = {
        filterItems: tmpFilterItems,
        selectedItems: []
      };
      // give polymer time to catch up
      this.debounce('rendering', function() {
        _this._selectedItems.length > 0
          ? (_this._showActiveFilterLabels = true)
          : (_this._showActiveFilterLabels = false);
        _this.fire('bah-filter-changed', filterObj);
      });
      _this._clearCachedFilters();
    },

    /**
     * Clears the cached filter options by setting the expiration date to the past
     */
    _clearCachedFilters: function _clearCachedFilters() {
      localStorage.setItem('filters', '');
    },

    /**
     * Computes the selected sort value by finding the sort option with selected set to true
     * @param {Array} options - the sort option objects to loop through
     * @return {String}
     */
    computeSelectedSortValue: function computeSelectedSortValue(options) {
      if (!_.isNil(options)) {
        var selectedSortObj = _.find(options, {selected: true});
        this._showSortOptions = false;
        if (!_.isNil(selectedSortObj)) {
          return selectedSortObj.val;
        }
      }
    },

    /**
     * When the bah-filter-changed event is thrown, set the selected
     * items based on the event selectedItems data
     * @param {Object} e - the bah-filter-changed event
     */
    handleFilterChange: function(e) {
      this._setSelectedItems(e.detail.selectedItems);
    },

    /**
     * When a user clicks on the filter span,
     * if showFilter is true, add classes to change font weight and change icon
     * if showFilter is false, remove classes to remove font weight and change icon
     */
    handleShowFiltersChange: function() {
      if (this._showFilters) {
        this.$.filterAngleIcon.icon = 'fa:fa-angle-up';
        this.$.filterIcon.classList.add('weight--semibold');
        this.$.filterText.classList.add('weight--semibold');
        this.$.filterOption.classList.add('div-white-background');
        this._showActiveFilterLabels = false;
      } else {
        this.$.filterAngleIcon.icon = 'fa:fa-angle-down';
        this.$.filterIcon.classList.remove('weight--semibold');
        this.$.filterText.classList.remove('weight--semibold');
        this.$.filterOption.classList.remove('div-white-background');
        this._selectedItems.length > 0
          ? (this._showActiveFilterLabels = true)
          : (this._showActiveFilterLabels = false);
      }
    },

    /**
     * When a user clicks on the sort span,
     * if showSortOptions is true, add classes to change font weight and change icon
     * if showSortOptions is false, remove classes to remove font weight and change icon
     */
    handleShowSortOptionsChange: function() {
      if (this.showSortOptionsInHeader) {
        if (this._showSortOptions) {
          this.$$('#sortAngleIcon').icon = 'fa:fa-angle-up';
          this.$$('#sortIcon').classList.add('weight--semibold');
          this.$$('#sortText').classList.add('weight--semibold');
          this.$$('#sortOption').classList.add('div-white-background');
          this._showActiveFilterLabels = false;
        } else {
          this.$$('#sortAngleIcon').icon = 'fa:fa-angle-down';
          this.$$('#sortIcon').classList.remove('weight--semibold');
          this.$$('#sortText').classList.remove('weight--semibold');
          this.$$('#sortOption').classList.remove('div-white-background');
          this._selectedItems.length > 0
            ? (this._showActiveFilterLabels = true)
            : (this._showActiveFilterLabels = false);
        }
      }
    },

    /**
     * Sets the selected items for the activeFilters dom repeat.
     * The selected items are formatted from the bah-filter-change event data
     * @param {Array} selectedItems - selected items array from bah-filter-change event
     */
    _setSelectedItems: function(selectedItems) {
      var _this = this;
      var formattedSelectedItems = [];
      if (selectedItems) {
        for (var outerIdx = 0; outerIdx < selectedItems.length; outerIdx++) {
          for (var innerIdx = 0; innerIdx < selectedItems[outerIdx].items.length; innerIdx++) {
            formattedSelectedItems.push({
              filterItemName: selectedItems[outerIdx].name,
              val: selectedItems[outerIdx].items[innerIdx].val
            });
          }
        }
      }
      // give polymer time to catch up
      this.debounce('rendering', function() {
        // set selected items
        _this.set('_selectedItems', formattedSelectedItems);
        _this._selectedItems.length > 0
          ? (_this._showActiveFilterLabels = true)
          : (_this._showActiveFilterLabels = false);
      });
    },

    /**
     * When user taps the filter button, hide sort and show filters
     */
    _toggleShowFilters: function() {
      this._showSortOptions = false;
      this._showFilters = !this._showFilters;
    },

    /**
     * Toggles selected view from summary to detail or detail to summary, then fires
     * the bah-sort-and-filter-view-change
     * Event data specs (e.detail): **{selectedView: 'Summary View'}**
     * @event bah-sort-and-filter-view-change
     */
    toggleSelectedView: function() {
      if (this.selectedView === this.summaryView) {
        this.selectedView = this.detailedView;
        this.selectedViewIcon = this.detailedViewIcon;
      } else {
        this.selectedView = this.summaryView;
        this.selectedViewIcon = this.summaryViewIcon;
      }
      this.fire('bah-sort-and-filter-view-change', {selectedView: this.selectedView});
      this._cacheSelectedView();
    },

    /**
     * Caches the selected view
     */
    _cacheSelectedView: function _cacheSelectedView() {
      try {
        localStorage.setItem('selectedView', JSON.stringify(this.selectedView));
      } catch(e) {}
    },
    /**
     * Sets the selected view
     * @param {String} selectedView - the selected view to be loaded
     */
    _setSelectedViewFromCache: function _setSelectedViewFromCache(selectedView) {
      if (selectedView) {
        this.selectedView = selectedView;
        this.fire('bah-sort-and-filter-view-change', {selectedView: this.selectedView});
      }
    }
  });
})();
