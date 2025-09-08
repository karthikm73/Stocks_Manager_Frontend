define(['../accUtils', 'knockout', 'ojs/ojcorerouter', "ojs/ojbootstrap", "oj-c/button", "oj-c/input-text", "oj-c/form-layout", "ojs/ojknockout","oj-c/input-password"],
  function (accUtils, ko, CoreRouter, Bootstrap) {
    function LoginViewModel() {
      var self = this;

      this.signin = ko.observable(false);
      this.changeToOther=function(){
        this.signin(!this.signin());
      }

      this.firstName = ko.observable('');

      this.lastName = ko.observable('');

      this.phoneNumber = ko.observable('');

      this.city = ko.observable('');

      this.emailId = ko.observable('');
      this.password= ko.observable('');

      this.isLoggedIn = ko.observable(localStorage.getItem("isLoggedIn") === "true"); 

      localStorage.setItem("isLoggedIn", this.isLoggedIn() ? "true" : "false");
      
      self.submitCustomer = function () {
        // Basic validation
        if (!self.firstName() || !self.lastName() || !self.phoneNumber() || !self.city() || !self.emailId()) {
          alert("All fields are required.");
          return;
        }

        const payload = {
          firstName: self.firstName(),
          lastName: self.lastName(),
          phoneNumber: self.phoneNumber(),
          emailId: self.emailId(),
          city: self.city()
        };

        fetch('http://localhost:8081/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
          .then(response => {
            if (!response.ok) {
              alert("Cannot add customer at the moment try again later");
              return;
            };
            return response.json();
          })
          .then(data => {
            alert("Customer SignUp Successfull!");
            localStorage.setItem("isLoggedIn", true);
            localStorage.setItem("emailId", data.data.emailId);
            localStorage.setItem("userId", data.data.customerId);
            this.isLoggedIn(true)
            location.reload();
            CoreRouter.rootInstance.go({ path: 'stocks' });
          })
          .catch(error => {
            console.error("Error adding customer:", error);
          });
      };

      this.submitAdmin=function(){
        // Basic validation
        if (!self.firstName() || !self.lastName() || !self.phoneNumber() || !self.city() || !self.emailId() || !self.password()) {
          alert("All fields are required.");
          return;
        }

        const payload = {
          firstName: self.firstName(),
          lastName: self.lastName(),
          phoneNumber: self.phoneNumber(),
          emailId: self.emailId(),
          city: self.city()
        };

        fetch('http://localhost:8081/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
          .then(response => {
            if (!response.ok) {
              alert("Admin cannot be added");
              return;
            }
            return response.json();
          })
          .then(data => {
            alert("Admin Signup Successful!");
            localStorage.setItem("isLoggedIn", true);
            localStorage.setItem("emailId", data.data.emailId);
            localStorage.setItem("userId", data.data.customerId);
            localStorage.setItem("isAdmin",true);
            this.isLoggedIn(true)
            location.reload();
            CoreRouter.rootInstance.go({ path: 'stocks' });
          })
          .catch(error => {
            console.error("Error adding customer:", error);
          });
      }

      this.loginCustomer=function(){

        if (!self.emailId() || !self.password()) {
          alert("All fields are required.");
          return;
        }

        fetch(`http://localhost:8081/customers/login/${this.emailId()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
        })
          .then(response => {
            if (!response.ok) {
              alert("Customer doesnt exit");
              return;
            }
            return response.json();
          })
          .then(data => {
            alert("Customer Login Successful!");
            localStorage.setItem("isLoggedIn", true);
            localStorage.setItem("emailId", data.data.emailId);
            localStorage.setItem("userId", data.data.customerId);
            localStorage.setItem("isAdmin",false);
            this.isLoggedIn(true)
            location.reload();
            CoreRouter.rootInstance.go({ path: 'stocks' });
          })
          .catch(error => {
            console.error("Error login customer:", error);
          });

      }

      this.loginAdmin=function(){

        if (!self.emailId() || !self.password()) {
          alert("All fields are required.");
          return;
        }

        fetch(`http://localhost:8081/customers/login/${this.emailId()}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
        })
          .then(response => {
            if (!response.ok) {
              alert("Admin doesnt exit");
              return;
            };
            return response.json();
          })
          .then(data => {
            alert("Admin Login Successful!");
            localStorage.setItem("isLoggedIn", true);
            localStorage.setItem("emailId", data.data.emailId);
            localStorage.setItem("userId", data.data.customerId);
            localStorage.setItem("isAdmin",true);
            this.isLoggedIn(true)
            location.reload();
            CoreRouter.rootInstance.go({ path: 'stocks' });
          })
          .catch(error => {
            alert("Admin login error");
            console.error("Error login Admin:", error);
          });

      }

      this.connected = () => {
        accUtils.announce('Login page loaded.', 'assertive');
        document.title = "Login";

        if (this.isLoggedIn()) {
          CoreRouter.rootInstance.go({ path: 'stocks' });
        }

      };

      /**
       * Optional ViewModel method invoked after the View is disconnected from the DOM.
       */
      this.disconnected = () => {
        // Implement if needed
      };

      /**
       * Optional ViewModel method invoked after transition to the new View is complete.
       * That includes any possible animation between the old and the new View.
       */
      this.transitionCompleted = () => {
        // Implement if needed
      };
    }

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return LoginViewModel;
  }
);
