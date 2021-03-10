(function() {
  'use strict';

  Polymer({
    is: 'bah-group-checkbox',

    properties: {
      /**
       * Property used just for displaying Items, so it can be properly filter
       */
      _displayItems: {
        type: Array
      },
      /**
       * Items to be showns as checkbox.
       * Array of Objects.
       * @type {Array<Object>}
       */
      items: {
        type: Array,
        observer: '_handleItemsChange',
        notify: true
      },
      /**
       * Input for searching items inside group
       */
      _searchInput: {
        type: String,
        value: '',
        observer: '_handleSearchInputChange'
      },
      /**
       * Property to enable search functionality for group
       */
      showSearch: {
        type: Boolean,
        value: true
      },
      /**
       * Group title
       */
      title: {
        type: String
      },
      /**
       * Property to enable just single selection from all the values passed
       */
      singleSelection: {
        type: Boolean,
        value: false
      },
      /**
       * Property to keep display order for checkbox items
       */
      maintainOrderForItems: {
        type: Boolean,
        value: false
      }
    },

    /**
     * function called on-change of checkbox
     * @param {Object} e: event
     * @private
     */
    _checkBoxChanged: function _checkBoxChanged(e) {
      var index = _.indexOf(this.items, _.find(this.items, {
        val: e.target.attributes['display-value'].value
      }));
      this.items[index].selected = !this.items[index].selected;
      this._sortItemsWithSelectedProperty();
    },

    /**
     * function called on-change of radio button
     * @param {Object} e: event
     * @private
     */
    _radioBtnChanged: function _radioBtnChanged(e) {
      var index = _.indexOf(this.items, _.find(this.items, {
        val: e.target.attributes['display-value'].value
      }));
      for (var i = 0; i < this.items.length; i++) {
        if (i === index) {
          this.items[i].selected = true;
        } else {
          this.items[i].selected = false;
        }
      }
      this._sortItemsWithSelectedProperty();
    },

    /**
     * function to set display items, when items property is changed.
     * Observer to items property
     * @private
     */
    _handleItemsChange: function _handleItemsChange() {
      this._displayItems = this.items;
      this._sortItemsWithSelectedProperty();
    },

    /**
     * function to filter display items based on fuzzy search using fuse.js
     * Observer to _searchInput property
     * @private
     */
    _handleSearchInputChange: function _handleSearchInputChange() {
      // var _this = this;
      if (!this._searchInput || this._searchInput === '') {
        this._displayItems = this.items;
        this._sortItemsWithSelectedProperty();
      } else {
        // fuzzy search using fuse.js
        var fuseOption = {
          shouldSort: true,
          threshold: 0.8,
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 1,
          keys: ['val']
        };
        var fuse = new Fuse(this.items, fuseOption);
        this._displayItems = fuse.search(this._searchInput);
      }
    },

    /**
     * function to sort display items based on selected false and val
     * @private
     */
    _sortItemsWithSelectedProperty: function _sortItemsWithSelectedProperty() {
      if (!this.maintainOrderForItems) {
        this._displayItems = _.sortBy(this._displayItems, [function(item) {
          return !item.selected;
        }, 'val']);
      }
    }
  });
}());
