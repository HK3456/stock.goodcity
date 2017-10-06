import Ember from 'ember';
const { getOwner } = Ember;

export default Ember.Route.extend({

  i18n: Ember.inject.service(),
  isErrPopUpAlreadyShown: false,
  isItemUnavailable: false,
  isLoginPopUpAlreadyShown: false,
  logger: Ember.inject.service(),
  messageBox: Ember.inject.service(),


  init() {
    var _this = this;
    var storageHandler = function (object) {
      if(!window.localStorage.getItem('authToken')) {
        object.get('messageBox').alert(object.get("i18n").t('must_login'), () => {
          object.transitionTo('login');
        });
      }
    };
    window.addEventListener("storage", function() {
      storageHandler(_this);
    }, false);
  },

  showSomethingWentWrong(reason) {
    this.get("logger").error(reason);
    if(!this.get('isErrPopUpAlreadyShown')) {
      this.set('isErrPopUpAlreadyShown', true);
      this.get("messageBox").alert(this.get("i18n").t("unexpected_error"), () => {
        this.set('isErrPopUpAlreadyShown', false);
      });
    }
  },

  showItemIsNotAvailable() {
    this.set('isItemUnavailable', true);
    if(this.get("target").currentPath !== "index") {
      this.get("messageBox").alert('This item is not available.', () => {
        this.set('isItemUnavailable', false);
        this.transitionTo('items.index');
      });
    }
  },

  showMustLogin() {
    if (this.session.get('isLoggedIn') && !this.get('isLoginPopUpAlreadyShown')) {
      this.set('isLoginPopUpAlreadyShown', true);
      this.get('messageBox').alert(this.get("i18n").t('must_login'), () =>
        this.set('isLoginPopUpAlreadyShown', false),
        this.session.clear(),
        this.store.unloadAll(),
        this.transitionTo('login')
      );
    }
  },

  beforeModel(transition = []) {
    try {
      localStorage.test = "isSafariPrivateBrowser";
    } catch (e) {
      this.get("messageBox").alert(this.get("i18n").t("QuotaExceededError"));
    }
    localStorage.removeItem('test');
    if (transition.queryParams.ln) {
      var language = transition.queryParams.ln === "zh-tw" ? "zh-tw" : "en";
      this.set('session.language', language);
    }

    Ember.onerror = window.onerror = error => {
      if(error.errors && error.errors[0] && error.errors[0].status === "401") {
        transition.abort();
      }
      this.handleError(error);
    };
  },

  handleError: function(reason) {
    try
    {
      var status;
      // let hasPopup = Ember.$('.reveal-modal:visible').length > 0;
      try { status = parseInt(reason.errors[0].status, 10); }
      catch (err) { status = reason.status; }

      if(!window.navigator.onLine){
        this.get("messageBox").alert(this.get("i18n").t("offline_error"));
        if(!reason.isAdapterError){
          this.get("logger").error(reason);
        }
      } else if(reason.name === "QuotaExceededError") {
        this.get("logger").error(reason);
        this.get("messageBox").alert(this.get("i18n").t("QuotaExceededError"));
      } else if (reason.name === "NotFoundError" && reason.code === 8) {
        return false;
      } else if (status === 401) {
        this.showMustLogin();
      } else {
        if(reason.message.includes('stockit_item') && reason.message.includes('404') && !this.get('isItemUnavailable')) {
          this.showItemIsNotAvailable();
        } else {
          this.showSomethingWentWrong(reason);
        }
      }

    } catch (err) {
      console.log(err);
    }
  },

  actions: {
    loading() {
      Ember.$(".loading-indicator").remove();
      var view = getOwner(this).lookup('component:loading').append();
      this.router.one('didTransition', view, 'destroy');
    },

    error(reason) {
      try {
        this.handleError(reason);
      } catch (err) {
        console.log(err);
      }
    },

    logMeOut() {
      this.session.clear();
      this.store.unloadAll();
      this.transitionTo('login');
    }
  }
});
