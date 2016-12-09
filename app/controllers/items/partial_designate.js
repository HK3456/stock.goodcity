import Ember from "ember";

export default Ember.Controller.extend({

  actions: {
    designate_partial_qty(item) {
      var partial_qty = parseInt(Ember.$(`#${item.id}`)[0].value);
      this.transitionToRoute('items.search_order', item.id, {queryParams: {partial_qty: partial_qty}});
    }
  }
});