var orderSheet = {
  init: function init() {
    var self = this;
    self.restoreState();
    self.bindActions();
  },
  bindActions: function bindActions() {
    $(".order-nav").on("click", "a", function onClick() {
      var jThis = $(this),
        catagory = jThis.attr("data-catagory");
      $("#order-form").find("#" + catagory).addClass("show").siblings().removeClass("show");
      jThis.addClass("active").siblings().removeClass("active");
      if (jThis.hasClass("loaded")) return;
      $.ajax({
        url: "data/" + catagory + ".json",
        dataType: "JSON"
      }).done(function(data) {
        renderSection({
          catagory: catagory,
          data: data
        });
        jThis.addClass("loaded");
      });

      openTabs.push(catagory);
      localStorage.setItem("openTabs", JSON.stringify(openTabs));

    });

    $("#order-form").on("click", ".item-action", function() {
      var jThis = $(this),
        action = jThis.attr("data-action"),
        itemEle = jThis.closest("li"),
        id = itemEle.attr("data-id");

      if (action === "add") {
        itemEle.addClass("selected");
        addToOrder({
          id: id,
          price: itemEle.find(".item-price strong").text(),
          title: itemEle.find(".item-title").text(),
          qty: itemEle.find(".item-qty-input").val()
        });
      } else {
        itemEle.removeClass("selected");
        removeFromOrder(id);
      }
    });

    $("#order-form").on("input", ".item-qty-input", function() {
      var jThis = $(this),
        val = jThis.val(),
        itemEle = jThis.closest("li"),
        id = itemEle.attr("data-id");
      if (isItemInOrder(id)) {
        orderSummary[id].qty = val;
        getSummaryLineEle(id).find(".item-qty-input").val(val);
      }
      saveLocaly();
    });

    $("#order-summary").on("input", ".item-qty-input", function() {
      var jThis = $(this),
        val = jThis.val(),
        itemEle = jThis.closest("li"),
        id = itemEle.attr("data-id");
      if (isItemInOrder(id)) {
        orderSummary[id].qty = val;
        getItemLineEle(id).find(".item-qty-input").val(val);
      }
      saveLocaly();
    });

    $("#order-summary").on("input", ".item-comment-input", function() {
      var jThis = $(this),
        val = jThis.val(),
        itemEle = jThis.closest("li"),
        id = itemEle.attr("data-id");
      if (isItemInOrder(id)) {
        orderSummary[id].comment = val;
      }
      saveLocaly();
    });



    $("#order-summary").on("click", ".remove-item", function() {
      var id = $(this).closest("li").attr("data-id");
      removeFromOrder(id);
      getSummaryLineEle().removeClass("selected").find(".item-select").prop("checked", false);
    });

    $("#order-summary").on("input", ".item-comment-input", function() {
      var jThis = $(this),
        val = jThis.val(),
        itemEle = jThis.closest("li"),
        id = itemEle.attr("data-id");
      if (isItemInOrder(id)) {
        orderSummary[id].comment = val;
      }
      saveLocaly();
    });

    $(".submit-order").on("click", function onSubmitOrder(argument) {
      // validate...
      submitOrder();
    });

    $("#order-details").on("change", "input", function() {
      var jThis = $(this),
        name = jThis.attr("name"),
        value = jThis.val();
      orderDetails[name] = value;
      localStorage.setItem("orderDetails", JSON.stringify(orderDetails));
    });
  },
  initialRender: function initialRender() {
    var self = this;
    $.ajax({
      url: "data/categories.json",
      dataType: "JSON"
    }).done(function renderCatagories(categories) {
      $(".order-nav").html(tmpl("categoryNavTmpl", categories));
      $("#order-form").html(tmpl("categorySectionContainerTmpl", categories));
      self.loadSavedState();
    });
  },
  openTabs: [],
  orderDetails: {},
  orderSummary: {}
};

// add local storage



getSummaryLineEle = function getSummaryLineEle(id) {
  return $("#order-summary").find("[data-id=" + id + "]");
};
getItemLineEle = function getItemLineEle(id) {
  return $("#order-form").find("[data-id=" + id + "]");
};

renderSection = function renderSection(dataObj) {
  console.log(dataObj);
  var ele = $("#" + dataObj.catagory);
  ele.html(tmpl("catagoryTmpl", dataObj));
};

addToOrder = function addToOrder(obj) {
  if (!orderSummary[obj.id]) {
    orderSummary[obj.id] = obj;
    refreshOrderSummary();
  }
  saveLocaly();
};
removeFromOrder = function removeFromOrder(id) {
  if (orderSummary[id]) {
    delete orderSummary[id];
    refreshOrderSummary();
  }

};
isItemInOrder = function isItemInOrder(id) {
  return orderSummary[id] ? true : false;
};

refreshOrderSummary = function refreshOrderSummary() {
  $("#order-summary").find("ul").html(tmpl("orderSummaryTmpl", {}));
  $("#order-total").html(tmpl("orderTotalTmpl"), {});
};

saveLocaly = function saveLocaly() {
  // 
  localStorage.setItem("orderSummery", JSON.stringify(orderSummary));
};

submitOrder = function submitOrder() {
  var dfd = $.Deferred();
  orderSummaryArr = $.map(orderSummary, function(value, index) {
    return value;
  });

  var orderPayload = {
    orderSummaryString: orderSummary,
    orderDetailString: orderDetails
  }

  orderPayload = JSON.stringify(orderPayload)
    // 
  $.ajax({
    url: "API/submitOrder.php",
    data: {
      orderData: orderPayload
    },
    type: "POST"
  }).done(function onSubmit(data) {
    dfd.resolve(data);
  }).done(function orderSucsess() {
    $(".submit-order").before($("#sucsessTmpl").html());
    $(".submit-order").remove();
    localStorage.clear();
  }).fail(function orderFail(err) {
    // 
    if (navigator.onLine) {
      alert("You appear to be online, And it will still not submit, somthing is worng...");
    } else {
      submitOffline();
    }
  });
  // if succeses 
  // clearStorage
  return dfd;
};


submitOffline = function() {
  var offlineOrderCount = localStorage.getItem("offline-order-count") || 0,
    getOfflineOrders = localStorage.getItem("offline-orders");
  getOfflineOrders = getOfflineOrders ? JSON.parse(getOfflineOrders) : [];
  getOfflineOrders.push({
    orderSummaryString: orderSummary,
    orderDetailString: orderDetails
  });


  localStorage.setItem("offline-order-count", ++offlineOrderCount);
  localStorage.setItem("offline-orders", JSON.parse(getOfflineOrders));
  localStorage.clear();

  alert("Your order has been submitted offline, Make sure to submit it when you are online again");
}


}

//capitalizeFirstLetter
String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};



$(document).ready(function() {


  loadSavedState = function loadSavedState() {

    // get storaed items
    var savedItems = localStorage.getItem("orderSummery"),
      savedOpenTabs = localStorage.getItem("openTabs"),
      saveOrderDetails = localStorage.getItem("orderDetails"),
      itemLineEle,
      itemObj,
      summaryLineEle;
    if (savedOpenTabs) {
      savedOpenTabs = JSON.parse(savedOpenTabs);
      savedOpenTabs.forEach(function(e) {
        console.log(e);
        $(".order-nav").find("[data-catagory=" + e + "]").trigger("click");
      });
    }

    if (savedItems) {
      savedItems = JSON.parse(savedItems);
      setTimeout(function() {
        Object.keys(savedItems).forEach(function(e) {
          itemObj = savedItems[e];
          itemLineEle = getItemLineEle(e);
          itemLineEle.find(".item-qty-input").val(savedItems[e].qty);
          itemLineEle.find(".item-add").trigger("click");
          // need to fix 
          if (itemObj.comment) {
            summaryLineEle = getSummaryLineEle(e);
            summaryLineEle.find(".item-comment-input").val(itemObj.comment);
          }
        });

      }, 3000);

      localStorage.setItem("orderDetails", JSON.stringify(orderDetails));

    }

    if (saveOrderDetails) {
      saveOrderDetails = JSON.parse(saveOrderDetails);
      orderDetailsKeys = Object.keys(saveOrderDetails);

      orderDetailsKeys.forEach(function(e) {
        $("#order-details").find("[name='" + e + "']").val(saveOrderDetails[e]);

      });
    }
  };
});