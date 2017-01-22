var orderSheet = {},
  openTabs = [],
  orderDetails = {},
  orderSummary = {};


$(".order-nav").on("click", "a", function onNavClick(e) {
  e.preventDefault();

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

$(document).on('click', "img", function() {
  $('.enlargeImageModalSource').attr('src', $(this).attr('src'));
  $('#enlargeImageModal').modal('show');
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
      price: itemEle.find(".item-price").attr("data-price"),
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
    refreshOrderTotals();
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
    refreshOrderTotals();
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

$("#order-information").on("submit", function onSubmitOrder(e) {
  e.preventDefault();
  // validate...

  if (navigator.onLine === false) {
    submitOffline();
    return;
  }
  submitOrder();
});



$(document).on("click", ".clearData", function clearData(e) {
  e.preventDefault();


  var jThis = $(this),
    type = jThis.attr("data-type");
  if (type === "all") {
    //clearTempSavedData();
  } else {
    clearTempSavedData();
  }
  location.reload();
});

// toggle-offline-orders



$("#order-details").on("change", ":input", function() {
  var jThis = $(this),
    name = jThis.attr("name"),
    value = jThis.val();
  orderDetails[name] = value;
  localStorage.setItem("orderDetails", JSON.stringify(orderDetails));
});


$(document).on("click", ".toggle-offline-orders", function onToggleOfflineOrders(e) {
  e.preventDefault();
  renderOfflineOrders();
  toggleOfflineOrders();
});

renderOfflineOrders = function renderOfflineOrders() {
  if ($(".offline-orders-container").length) return;

  offlineOrders = localStorage.getItem("offline-orders");
  if (!offlineOrders) return;
  offlineOrders = JSON.parse(offlineOrders);
  $("body").append(tmpl("offlineOrdersTmpl", offlineOrders));

};
toggleOfflineOrders = function toggleOfflineOrders() {
  $("#offline-orders-container").addClass("show");
  $("body").addClass("modal-active");
}


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
    refreshOrderTotals();
  }
  saveLocaly();
};
removeFromOrder = function removeFromOrder(id) {
  if (orderSummary[id]) {
    delete orderSummary[id];
    refreshOrderSummary();
    refreshOrderTotals();
  }

};
isItemInOrder = function isItemInOrder(id) {
  return orderSummary[id] ? true : false;
};

refreshOrderSummary = function refreshOrderSummary() {
  $("#order-summary").find("ul").html(tmpl("orderSummaryTmpl", {}));
  refreshOrderTotals();
};

calculateOrderTotals = function calculateOrderTotals() {
  var ammount = 0,
    count = 0,
    totals = {};
  $.each(orderSummary, function(i, e) {
    ammount += e.price * e.qty;
    count += (+e.qty);
  });
  totals.ammount = ammount;
  totals.count = count;
  return totals;
};

refreshOrderTotals = function refreshOrderTotal() {
  $("#order-total").html(tmpl("orderTotalTmpl", calculateOrderTotals()));
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
    clearTempSavedData();
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


clearTempSavedData = function clearTempSavedData() {
  localStorage.removeItem("orderSummery");
  localStorage.removeItem("orderDetails");
  localStorage.removeItem("openTabs");
}


submitOffline = function() {
  var offlineOrderCount = localStorage.getItem("offline-order-count") || 0,
    getOfflineOrders = localStorage.getItem("offline-orders");
  getOfflineOrders = getOfflineOrders ? JSON.parse(getOfflineOrders) : [];
  getOfflineOrders.push({
    orderSummaryString: orderSummary,
    orderDetailString: orderDetails
  });


  localStorage.setItem("offline-order-count", ++offlineOrderCount);
  localStorage.setItem("offline-orders", JSON.stringify(getOfflineOrders));
  // localStorage.clear();

  alert("Your order has been submitted offline, Make sure to submit it when you are online again");
}

onOnlineChanger = function onOnlineChanger(e) {};
window.addEventListener('online', onOnlineChanger);
window.addEventListener('offline', onOnlineChanger);


setTimeout(function setDate() {
  Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0, 10);
  });
  $(".order-date :input").val(new Date().toDateInputValue()).trigger("input");
}, 1000);


$.ajax({
  url: "data/categories.json",
  dataType: "JSON"
}).done(function renderCatagories(categories) {
  $(".order-nav").html(tmpl("categoryNavTmpl", categories));
  $("#order-form").html(tmpl("categorySectionContainerTmpl", categories));
  loadSavedState();
});

loadSavedState = function loadSavedState() {

  // get storaed items
  var storedItems = localStorage.getItem("orderSummery"),
    storedOpenTabs = localStorage.getItem("openTabs"),
    storedOrderDetails = localStorage.getItem("orderDetails"),
    offlineOrder,
    itemLineEle,
    itemObj,
    summaryLineEle;


  if (storedItems || storedOpenTabs || storedOrderDetails) {
    $("body").prepend($("#savedDataTmpl").html());
  }

  if (storedOpenTabs) {
    storedOpenTabs = JSON.parse(storedOpenTabs);
    storedOpenTabs.forEach(function(e) {
      console.log(e);
      $(".order-nav").find("[data-catagory=" + e + "]").trigger("click");
    });
  }

  if (storedItems) {
    storedItems = JSON.parse(storedItems);
    setTimeout(function() {
      Object.keys(storedItems).forEach(function(e) {
        itemObj = storedItems[e];
        itemLineEle = getItemLineEle(e);
        itemLineEle.find(".item-qty-input").val(storedItems[e].qty);
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

  if (storedOrderDetails) {
    storedOrderDetails = JSON.parse(storedOrderDetails);
    orderDetailsKeys = Object.keys(storedOrderDetails);

    orderDetailsKeys.forEach(function(e) {
      $("#order-details").find("[name='" + e + "']").val(storedOrderDetails[e]);
    });
    orderDetails = storedOrderDetails;
  }

  // Handle offlineOrder
  offlineOrder = localStorage.getItem("offline-order-count");
  if (offlineOrder) {
    $(".container").prepend("<a class='toggle-offline-orders' href='#'>See Offline Orders</a>");
  }

};