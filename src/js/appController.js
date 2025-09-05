/**
 * @license
 * Copyright (c) 2014, 2025, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(['knockout', 'ojs/ojcontext', 'ojs/ojmodule-element-utils', 'ojs/ojknockouttemplateutils', 'ojs/ojcorerouter', 'ojs/ojmodulerouter-adapter', 'ojs/ojknockoutrouteradapter', 'ojs/ojurlparamadapter', 'ojs/ojresponsiveutils', 'ojs/ojresponsiveknockoututils', 'ojs/ojarraydataprovider',
  'ojs/ojdrawerpopup', 'ojs/ojmodule-element', 'ojs/ojknockout', 'ojs/ojlogger'],
  function (ko, Context, moduleUtils, KnockoutTemplateUtils, CoreRouter, ModuleRouterAdapter, KnockoutRouterAdapter, UrlParamAdapter, ResponsiveUtils, ResponsiveKnockoutUtils, ArrayDataProvider) {

    function ControllerViewModel() {

      this.KnockoutTemplateUtils = KnockoutTemplateUtils;

      // Handle announcements sent when pages change, for Accessibility.
      this.manner = ko.observable('polite');
      this.message = ko.observable();
      announcementHandler = (event) => {
        this.message(event.detail.message);
        this.manner(event.detail.manner);
      };

      document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);


      // Media queries for responsive layouts
      const smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      this.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
      const mdQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
      this.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

      let navData = [
        { path: '', redirect: 'stocks' },
        { path: 'Login', detail: { label: 'Login', iconClass: 'oj-ux-ico-chart-stock' } },
        { path: 'stocks', detail: { label: 'Stocks', iconClass: 'oj-ux-ico-chart-stock' } },
        { path: 'customers', detail: { label: 'Customers', iconClass: 'oj-ux-ico-contact-group' } },
        { path: 'transactions', detail: { label: 'Transaction', iconClass: 'oj-ux-ico-transaction-types' } },
        { path: 'about', detail: { label: 'About Us', iconClass: 'oj-ux-ico-bar-chart' } },

      ];

      this.isAdmin = ko.observable(localStorage.getItem("isAdmin") === "true");
      console.log(this.isAdmin());

      this.filteredNavData = ko.pureComputed(() => {
        return navData.filter(item => {
          if (item.path === 'customers' && !this.isAdmin()) {
            return false;
          }
          return true;
        });
      });

      // Router setup
      this.router = new CoreRouter(this.filteredNavData(), {
        urlAdapter: new UrlParamAdapter()
      });

      this.isLoggedIn = ko.observable(localStorage.getItem("isLoggedIn") === "true");
      // 🔑 Set as the root router (this is important!)
      CoreRouter.rootInstance = this.router;

      this.menuSelected = (event) => {
        console.log("callinfg the event");

        const selectedValue = event.detail.selectedValue;
        if (selectedValue === 'out') {
          // Call your sign out function here
          this.signOut();
        }
        else if (selectedValue === 'about') {
          // Handle profile click
        }
      };

      this.signOut = () => {
        // Your sign out logic
        console.log('Signing out...');
        localStorage.clear();
        // Navigate to login page or something else
        location.reload();
        CoreRouter.rootInstance.go({ path: 'Login' });
      };

      this.router.sync();
      this.moduleAdapter = new ModuleRouterAdapter(this.router);
      this.selection = new KnockoutRouterAdapter(this.router);

      // Navigation
      this.navDataProvider = new ArrayDataProvider(this.filteredNavData().slice(1), { keyAttributes: "path" });


      // Drawer
      self.sideDrawerOn = ko.observable(false);

      // Close drawer on medium and larger screens
      this.mdScreen.subscribe(() => { self.sideDrawerOn(false) });

      // Called by navigation drawer toggle button and after selection of nav drawer item
      this.toggleDrawer = () => {
        self.sideDrawerOn(!self.sideDrawerOn());
      }

      // Header
      // Application Name used in Branding Area
      this.appName = ko.observable("Stock Manager");
      // User Info used in Global Navigation area
      this.userLogin = ko.observable(localStorage.getItem("emailId") ?? "Please Login");

      // Footer
      this.footerLinks = [
        { name: 'About Us', linkId: 'aboutOracle', linkTarget: 'http://www.oracle.com/us/corporate/index.html#menu-about' },
        { name: "Contact Us", id: "contactUs", linkTarget: "http://www.oracle.com/us/corporate/contact/index.html" },
        { name: "Legal Notices", id: "legalNotices", linkTarget: "http://www.oracle.com/us/legal/index.html" },
        { name: "Terms Of Use", id: "termsOfUse", linkTarget: "http://www.oracle.com/us/legal/terms/index.html" },
        { name: "Your Privacy Rights", id: "yourPrivacyRights", linkTarget: "http://www.oracle.com/us/legal/privacy/index.html" },
      ];
    }
    // release the application bootstrap busy state
    Context.getPageContext().getBusyContext().applicationBootstrapComplete();



    return new ControllerViewModel();
  }
);
