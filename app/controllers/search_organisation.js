import Ember from "ember";
import searchModule from "./search_module";

export default searchModule.extend({
  minSearchTextLength: 4,

  onSearchTextChange: Ember.observer("searchText", function(){
    if(this.get('searchText')){
      Ember.run.debounce(this, this.applyFilter, 0);
    } else {
      this.set("filteredResults", []);
    }
  }),

  applyFilter() {
    var searchText = this.get("searchText");
    if (searchText.length > 0) {
      this.set("isLoading", true);
      this.set("hasNoResults", false);
      if(this.get("unloadAll")) { this.get("store").unloadAll(); }

      this.infinityModel("gc_organisation",
        { startingPage: 1, perPage: 25, modelPath: 'filteredResults',stockRequest: true },
        { searchText: "searchText"})
        .then(data => {
          if(this.get("searchText") === data.meta.search) {
            debugger
            this.set("filteredResults", data);
            this.set("hasNoResults", data.get("length") === 0);
          }
        })
        .finally(() => this.set("isLoading", false));
    }
    this.set("filteredResults", []);
  },

  actions: {
    cancelSearch() {
      Ember.$("#searchText").blur();
      this.send("clearSearch", true);
      this.transitionToRoute("index");
    }
  }
});
