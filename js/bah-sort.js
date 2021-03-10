Polymer({

  is: 'bah-sort',

  properties: {
    /*
     * The name of the component. It gets passed in when the event is fired
     */
    componentName: {
      type: String,
      value: 'bah-sort'
    },
    /*
     * An array of objects that is used to populate the px-dropdown.
     * It also includes a 'selected' property
     */
    options: {
      type: Array,
      notify: true
    },
    /*
     * The key of the currently selected dropdown item
     */
    selectedKey: {
      type: Number,
      value: 0
    },
    /*
     * The value of the currently selected dropdown item
     */
    selectedVal: {
      type: String,
      value: ''
    },

    /**
    * Cookie used for sort selection
    */
    bahSortCookie: {
      value: "bahSortCookie="
    },
  },

  /*
   * Sets the selectedValue, selectedKey, and selected properties
   * when the dropdown value changes. Then it fires an event with that information
   * Event data specs (e.detail): **{name: 'Dummy Name', key: 'Dummy key', val: 'Dummy val'}**
   * @param {Object} event - event from sort selection change
   * @event bah-sort-changed
   */
  _sortSelectionChanged: function(event) {
    this.selectedKey = event.model.__data__.item.key;
    this.selectedVal = event.model.__data__.item.val;
    // Change the selected property to true when the option changes in the px-action-menu
    for (var i = 0; i < this.options.length; i++) {
      if (this.options[i].key === this.selectedKey) {
        this.options[i].selected = true;
      } else {
        this.options[i].selected = false;
      }
    }

    var tempOptions = _.sortBy(this.options, function(o) {
      return !o.selected;
    });
    this.options = [];
    this.debounce('render items', function() {
      this.set('options', tempOptions);
    });

    var sortObj = {
      name: this.componentName,
      key: this.selectedKey,
      val: this.selectedVal
    }
    this.fire('bah-sort-changed', sortObj);
    //cache the sorted items once selected
    this._cacheSelectedSortOptions(sortObj)
  },
  /**
   * Caches all active filters and passes changes down to the bah-filter component through
   * data binding. The data binding should then fire an event to the implementer of the component
   */
  _cacheSelectedSortOptions: function (selectedSortObj){
    if(selectedSortObj){
      localStorage.setItem('sorter', JSON.stringify(selectedSortObj));
    }
  },

  /**
   * Retrieves the style for a select item
   * @param {Object} item - the item to get style for
   * @return {String}
   */
  _getStyleForItem: function _getStyleForItem(item) {
    return item.selected ? 'sort-option-selected font-size-15' : 'font-size-15';
  }
});
