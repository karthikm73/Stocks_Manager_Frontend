/**
 * @license
 * Copyright (c) 2014, 2025, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your Stocks ViewModel code goes here
 */
define(['../accUtils', 'knockout', 'ojs/ojcorerouter', 'ojs/ojinputtext', 'ojs/ojbutton'],
  function (accUtils, ko, CoreRouter) {
    function StocksViewModel() {

      const self = this;

      this.stocks = ko.observableArray([]);

      this.showAddStock = ko.observable(false);
      this.showAllStock = ko.observable(false);
      this.showUpdateStock = ko.observable(false);
      this.showDeleteStock = ko.observable(false);
      this.showMyAllStock = ko.observable(false);

      this.isAdmin = ko.observable(localStorage.getItem("isAdmin") === "true");


      this.isLoggedIn = ko.observable(localStorage.getItem("isLoggedIn") === "true");



      self.name = ko.observable('');
      self.price = ko.observable();
      self.volume = ko.observable();
      self.listedExchange = ko.observable('');
      self.listedDate = ko.observable('');
      self.listingPrice = ko.observable();

      this.addStock = function () {
        this.showAddStock(true);
        this.showAllStock(false);
        this.showUpdateStock(false);
        this.showDeleteStock(false);
      }
      self.submitStock = function () {
        const payload = {
          name: self.name(),
          price: self.price(),
          volume: self.volume(),
          listedExchange: self.listedExchange(),
          listedDate: self.listedDate(),
          listingPrice: self.listingPrice()
        };


        fetch('http://localhost:8081/stocks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
          .then(response => response.json())
          .then(data => {
            console.log('Stock added:', data);
            self.name('');
            self.price(null);
            self.volume(null);
            self.listedExchange('');
            self.listedDate('');
            self.listingPrice(null);
            self.showAddStock(false);
            alert("Stock Added Successfully");
            self.showAllStock(true);
            self.listStock();
          })
          .catch(error => {
            console.error('Error adding stock:', error);
          });
      };

      self.isFormValid = ko.pureComputed(function () {
        return self.name().trim() !== '' &&
          self.price() !== null && self.price() !== '' &&
          self.volume() !== null && self.volume() !== '' &&
          self.listedExchange().trim() !== '' &&
          self.listedDate().trim() !== '' &&
          self.listingPrice() !== null && self.listingPrice() !== '';
      });


      this.updateStock = function () {
        this.showAddStock(false);
        this.showAllStock(false);
        this.showUpdateStock(true);
        this.showDeleteStock(false);
        fetch('http://localhost:8081/stocks')
          .then(response => {
            if (!response.ok) throw new Error("Network response error");
            return response.json();
          })
          .then(data => {
            this.stocks(data.data.map(makeObservableStock));
          })
          .catch(error => {
            console.error(error);
          })
      }
      this.updateStockById = function (stock, id) {

        const updatedStock = {
          name: stock.name,
          price: stock.price,
          volume: stock.volume,
          listedExchange: stock.listedExchange,
          listedDate: stock.listedDate,
          listingPrice: stock.listingPrice
        };

        fetch('http://localhost:8081/stocks/' + id, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedStock)
        })
          .then(response => {
            if (!response.ok) {
              throw new Error("Failed to update stock.");
            }
            return response.json();
          })
          .then(data => {
            alert('Stock updated successfully!');
            self.listStock(); // refresh list
          })
          .catch(error => {
            console.error('Error updating stock:', error);
            alert('Error updating stock.');
          });

      }

      this.stockId = ko.observable('');
      self.isDeleteValid = ko.pureComputed(function () {
        return self.stockId().trim() !== ''
      });

      this.deleteStock = function () {
        this.showAddStock(false);
        this.showAllStock(false);
        this.showUpdateStock(false);
        this.showDeleteStock(true);
        fetch('http://localhost:8081/stocks')
          .then(response => {
            if (!response.ok) throw new Error("Network response error");
            return response.json();
          })
          .then(data => {
            this.stocks(data.data.map(makeObservableStock));
          })
          .catch(error => {
            console.error(error);
          })
      }

      this.deleteStockById = function (stockId1) {

        fetch('http://localhost:8081/stocks/' + stockId1, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
        })
          .then(response => response.json())
          .then(data => {

            self.showDeleteStock(false);
            alert("Stock Deleted Successfully");
            self.showAllStock(true);
            self.listStock();
          })
          .catch(error => {
            console.error('Error Deleting stock:', error);
          });

      }

      function makeObservableStock(stock) {
        stock.showQuantity = ko.observable(false);
        stock.quantity = ko.observable(0);
        return stock;
      }


      this.listStock = function () {
        this.showAddStock(false);
        this.showAllStock(true);
        this.showUpdateStock(false);
        this.showDeleteStock(false);
        this.showMyAllStock(false);



        // When you set stocks:


        fetch('http://localhost:8081/stocks')
          .then(response => {
            if (!response.ok) throw new Error("Network response error");
            return response.json();
          })
          .then(data => {
            this.stocks(data.data.map(makeObservableStock));
          })
          .catch(error => {
            console.error(error);
          })
      }

      this.totalAssetValue = ko.observable(0)


      this.listMyStocks = function () {
        this.showAddStock(false);
        this.showAllStock(false);
        this.showUpdateStock(false);
        this.showDeleteStock(false);
        this.showMyAllStock(true);
        this.customerId = localStorage.getItem("userId");

        fetch(`http://localhost:8081/transactions/customer/${this.customerId}`)
          .then(response => {
            if (!response.ok) throw new Error("Network response error");
            return response.json();
          })
          .then(data => {
            const stockMap = new Map();

            data.data.forEach(txn => {
              const stockId = txn.stock.stockId;
              const rawQty = Number(txn.qty);
              const txnType = txn.txnType;

              const signedQty = txnType === "SELL" ? -rawQty : rawQty;

              console.log(`Processing txn for stockId=${stockId}, qty=${rawQty}, type=${txnType}`);

              if (!stockMap.has(stockId)) {
                console.log(`Adding stock ${stockId} with qty ${signedQty}`);
                stockMap.set(stockId, {
                  stockId,
                  name: txn.stock.name,
                  price: txn.stock.price,
                  volume: txn.stock.volume,
                  listedExchange: txn.stock.listedExchange,
                  listedDate: txn.stock.listedDate,
                  listingPrice: txn.stock.listingPrice,
                  qty: signedQty
                });
              } else {
                const existing = stockMap.get(stockId);
                existing.qty += signedQty;
                console.log(`Updated stock ${stockId} qty to ${existing.qty}`);
              }
            });

            const stocksWithQty = Array.from(stockMap.values()).filter(stock => stock.qty > 0);

            console.log("Stocks with qty > 0:", stocksWithQty);

            
            let totalAssetValue = 0;
            // After stocksWithQty is created

            stocksWithQty.forEach(stock => {
              stock.assetValue1 = (Number(stock.price) * stock.qty);
              stock.assetValue =(Number(stock.price) * stock.qty).toFixed(2) ;
              totalAssetValue += stock.assetValue1;
            });
            this.stocks(stocksWithQty.map(makeObservableStock));

            this.totalAssetValue(totalAssetValue);
          })


          .catch(error => {
            this.stocks([]); // fallback to empty array on error
            console.error(error);
          })

      }



      this.showQuantity = ko.observable(false);
      this.changeShowQuantity = function () {
        this.showQuantity(!this.showQuantity());
      }
      this.qty = ko.observable('');

      this.buyStockById = function (stock, qty) {
        const customerId = localStorage.getItem("userId");
        if (!qty || qty <= 0) {
          alert("Please enter a valid quantity.");
          return;
        }

        const payload = {
          customer: {
            customerId: parseInt(customerId)
          },
          stock: {
            stockId: stock.stockId
          },
          txnPrice: stock.price,

          txnType: "BUY",
          qty: qty
        };

        console.log("Sending transaction payload:", payload);

        fetch("http://localhost:8081/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        })
          .then(response => {
            if (!response.ok) {
              throw new Error("Failed to buy stock");
            }
            return response.json();
          })
          .then(data => {
            this.showQuantity(!this.showQuantity());
            this.qty(0);
            this.listMyStocks(true);
            this.showAllStock(false);
            alert('You bought the stocks');


            console.log("Transaction successful:", data);

          })
          .catch(error => {
            console.error("Error buying stock:", error);
          });
      };


      this.sellStockById = function (stock, qty) {
        const customerId = localStorage.getItem("userId");
        if (qty > stock.qty) {
          alert("Entered quantity is more");
          return;
        }
        if (!qty || qty <= 0) {
          alert("Please enter a valid quantity.");
          return;
        }

        const payload = {
          customer: {
            customerId: parseInt(customerId)
          },
          stock: {
            stockId: stock.stockId
          },
          txnPrice: stock.price,

          txnType: "SELL",
          qty: qty
        };

        console.log("Sending transaction payload:", payload);

        fetch("http://localhost:8081/transactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        })
          .then(response => {
            if (!response.ok) {
              throw new Error("Failed to buy stock");
            }
            return response.json();
          })
          .then(data => {
            this.showQuantity(!this.showQuantity());
            this.qty(0);
            this.listMyStocks(true);
            this.showAllStock(false);
            alert('You Sold the stocks');


            console.log("Transaction successful:", data);

          })
          .catch(error => {
            console.error("Error buying stock:", error);
          });
      };

















      this.connected = () => {
        accUtils.announce('Stocks page loaded.', 'assertive');
        document.title = "Stocks";
        if (!this.isLoggedIn()) {
          CoreRouter.rootInstance.go({ path: 'Login' });
        }
        if (this.isAdmin()) {
          self.listStock();

        } else {
          self.listMyStocks();
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

    return StocksViewModel;
  }
);
