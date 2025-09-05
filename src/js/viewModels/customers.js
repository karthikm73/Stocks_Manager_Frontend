define(['../accUtils', 'knockout','ojs/ojcorerouter'], function (accUtils, ko,CoreRouter) {
  function CustomerViewModel() {
    var self = this;

    this.isLoggedIn = ko.observable(localStorage.getItem("isLoggedIn") === "true"); 

    this.isAdmin = ko.observable(localStorage.getItem("isAdmin") === "true"); 

    // Section visibility observables
    self.showAllCustomers = ko.observable(false);
    self.showAddCustomer = ko.observable(false);
    self.showDeleteCustomer = ko.observable(false);
    self.showUpdateCustomer = ko.observable(false);

    // Form observables
    self.customerId = ko.observable();
    self.firstName = ko.observable('');
    self.lastName = ko.observable('');
    self.phoneNumber = ko.observable('');
    self.emailId = ko.observable('');
    self.city = ko.observable('');

    // Customer list
    self.customers = ko.observableArray([]);

    // Reset form fields
    self.resetForm = function () {
      self.customerId(null);
      self.firstName('');
      self.lastName('');
      self.phoneNumber('');
      self.city('');
      self.emailId('');
    };

    // List all customers
    self.listCustomer = function () {
      self.showAddCustomer(false);
      self.showDeleteCustomer(false);
      self.showUpdateCustomer(false);
      self.showAllCustomers(true);

      fetch('http://localhost:8081/customers')
        .then(response => response.json())
        .then(data => {
          self.customers(data.data || []);
        })
        .catch(error => console.error("Error fetching customers:", error));
    };

    // Add customer
    self.addCustomer = function () {
      self.resetForm();
      self.showAllCustomers(false);
      self.showDeleteCustomer(false);
      self.showUpdateCustomer(false);
      self.showAddCustomer(true);
    };

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
          if (!response.ok) throw new Error("Network response error");
          return response.json();
        })
        .then(data => {
          alert("Customer added successfully!");
          self.listCustomer();
        })
        .catch(error => {
          console.error("Error adding customer:", error);
        });
    };

    // Delete customer view
    self.deleteCustomer = function () {
      self.showAllCustomers(false);
      self.showAddCustomer(false);
      self.showUpdateCustomer(false);
      self.showDeleteCustomer(true);
    };

    self.deleteCustomerById = function (id) {
      if (!confirm("Are you sure you want to delete this customer?")) return;

      fetch(`http://localhost:8081/customers/${id}`, {
        method: 'DELETE'
      })
        .then(() => {
          alert("Customer deleted successfully.");
          self.listCustomer();
        })
        .catch(error => {
          console.error("Error deleting customer:", error);
        });
    };

    // Update customer view
    self.updateCustomer = function () {
      self.showAllCustomers(false);
      self.showAddCustomer(false);
      self.showDeleteCustomer(false);
      self.showUpdateCustomer(true);
    };

    self.editCustomer = function (customer) {
      self.customerId(customer.customerId);
      self.firstName(customer.firstName);
      self.lastName(customer.lastName);
      self.phoneNumber(customer.phoneNumber);
      self.emailId(customer.emailId);
      self.city(customer.city);
    };

    this.updateCustomerById = function (customer, customerId) {
      const updatedCustomer = {
        customerId: customer.customerId,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phoneNumber: customer.phoneNumber,
        emailId: customer.emailId,
        city: customer.city
      };

      fetch('http://localhost:8081/customers/' + customerId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedCustomer)
      })
        .then(response => {
          if (!response.ok) throw new Error('Failed to update customer');
          return response.json();
        })
        .then(data => {
          alert('Customer updated successfully');
          // Optional: refresh the customer list
          this.listCustomer();
        })
        .catch(error => {
          console.error('Error updating customer:', error);
        });
    };


    // Auto-load customers
    self.connected = function () {
      accUtils.announce('Customers page loaded.', 'assertive');
      document.title = "Customers";
      if (!this.isLoggedIn()) {
          CoreRouter.rootInstance.go({ path: 'Login' });
      }
      self.listCustomer();
    };

    self.disconnected = function () { };
    self.transitionCompleted = function () { };
  }

  return CustomerViewModel;
});
