import Ember from "ember";
import InfinityRoute from "ember-infinity/mixins/route";
import config from '../../config/environment';

export default Ember.Controller.extend(InfinityRoute, {
  sortProperties: ['itemId:desc', 'updatedAt:desc'],
  arrangedItems: Ember.computed.sort("filteredResults", "sortProperties"),
  searchText: "",
  i18n: Ember.inject.service(),
  isLoading: false,
  hasNoResults: false,
  itemSetId: null,
  isMobileApp: config.cordova.enabled,
  displayItemOptions: false,
  displaySetBlock: false,
  displayItemOptionsList: true,

  hasSearchText: Ember.computed("searchText", function() {
    return !!this.get("searchText").trim();
  }),

  onSearchTextChange: Ember.observer("searchText", function() {
    // wait before applying the filter
    this.set("itemSetId", null);
    Ember.run.debounce(this, this.applyFilter, 500);
  }),

  applyFilter() {
    var searchText = this.get("searchText").trim();
    if (searchText) {
      this.set("isLoading", true);
      this.set("hasNoResults", false);
      this.infinityModel("item",
        { perPage: 25, startingPage: 1, modelPath: 'filteredResults', stockRequest: true },
        { searchText: "searchText", itemId: "itemSetId" })
        .then(data => {
          this.set("filteredResults", data);
          this.set("hasNoResults", data.get("length") === 0);
        })
        .finally(() => this.set("isLoading", false));
    }
    this.set("filteredResults", []);
  },

  actions: {
    clearSearch() {
      this.set("searchText", "");
    }
  },

});
