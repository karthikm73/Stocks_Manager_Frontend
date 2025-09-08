
define(['../accUtils', 'knockout', 'ojs/ojcorerouter'],
  function (accUtils, ko, CoreRouter) {
    function TransactionsViewModel() {
      var self = this;
      this.isLoggedIn = ko.observable(localStorage.getItem("isLoggedIn") === "true");
      this.isAdmin = ko.observable(localStorage.getItem("isAdmin") === "true");


      self.transactions = ko.observableArray([]);

      self.listTransactions = function () {
        fetch('http://localhost:8081/transactions')
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch transactions');
            }
            return response.json();
          })
          .then(data => {
            self.filteredTransactions(data.data);
            self.transactions(data.data);
          })
          .catch(error => {
            console.error("Error fetching transactions:", error);
          });
      };
      this.customerId = localStorage.getItem('userId');

      self.listMyTransactions = function () {
        fetch(`http://localhost:8081/transactions/customer/${self.customerId}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch transactions');
            }
            return response.json();
          })
          .then(data => {
            self.filteredTransactions(data.data);
            self.transactions(data.data);
          })
          .catch(error => {
            console.error("Error fetching transactions:", error);
          });
      };

      // FILTERING LOGIC
      self.filteredTransactions = ko.observableArray([]);
      self.customerFilter = ko.observable('');
      self.stockFilter = ko.observable('');

      self.filterTransactions = function () {
        let custFilter = self.customerFilter().toLowerCase().trim();
        let stockFilter = self.stockFilter().toLowerCase().trim();
        let filtered = self.transactions().filter(txn => {
          const custName = (txn.customer.firstName + ' ' + txn.customer.lastName).toLowerCase();
          const custId = String(txn.customer.custId);
          const stockName = txn.stock.name.toLowerCase();
          const stockId = String(txn.stock.stockId);
          const matchesCustomer = custFilter === '' || custName.includes(custFilter) || custId.includes(custFilter);
          const matchesStock = stockFilter === '' || stockName.includes(stockFilter) || stockId.includes(stockFilter);
          return matchesCustomer && matchesStock;
        });
        self.filteredTransactions(filtered);
      };
      self.clearFilters = function () {
        self.customerFilter('');
        self.stockFilter('');
        self.filteredTransactions(self.transactions());
      };


      this.connected = () => {
        accUtils.announce('Transactions page loaded.', 'assertive');
        document.title = "Transactions";
        if (!this.isLoggedIn()) {
          CoreRouter.rootInstance.go({ path: 'Login' });
        }
        if (this.isAdmin()) {
          this.listTransactions();

        } else {
          this.listMyTransactions();
        }
        // Implement further logic if needed
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
    return TransactionsViewModel;
  }
);
