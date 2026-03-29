
// Code.gs - Updated with Persistent Categories
// Publish as a web app in Google Appsscript
function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({error: "No data received"}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const params = JSON.parse(e.postData.contents);
    const action = params.action || "";
    const sheetUrl = params.sheetUrl;

    if (!sheetUrl) {
      return ContentService.createTextOutput(JSON.stringify({error: "Sheet URL is required"}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.openByUrl(sheetUrl);

    function normalizeBarcode(barcode) {
  return String(barcode || "").trim().replace(/^0+/, '');
}

    // Ensure both sheets exist
    let invSheet = ss.getSheetByName("Inventory");
    if (!invSheet) {
      invSheet = ss.insertSheet("Inventory");
      invSheet.appendRow(["Barcode", "Name", "Cost", "Category", "CustomMarkup", "StockQty", "MinStockLevel", "ExpiryDate"]);
    }

    let catSheet = ss.getSheetByName("Categories");
    if (!catSheet) {
      catSheet = ss.insertSheet("Categories");
      catSheet.appendRow(["Category", "DefaultMarkup"]);
      catSheet.appendRow(["Snacks", 20]);
      catSheet.appendRow(["Drinks", 15]);
      catSheet.appendRow(["Other", 10]);
    }

    // ==================== getInventory ====================
    if (action === "getInventory") {
      const data = invSheet.getDataRange().getValues();
      if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

      const headers = data[0];
      const items = data.slice(1).map(row => {
        let obj = {};
        headers.forEach((h, i) => obj[h] = row[i]);
        return obj;
      });

      return ContentService.createTextOutput(JSON.stringify(items))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ==================== getCategories ====================
    if (action === "getCategories") {
      const data = catSheet.getDataRange().getValues();
      const categories = data.slice(1).map(row => ({
        name: String(row[0] || ""),
        markup: parseFloat(row[1]) || 10
      })).filter(c => c.name);

      return ContentService.createTextOutput(JSON.stringify(categories))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ==================== saveCategories ====================
    if (action === "saveCategories") {
      const catData = params.categories || [];
      // Clear existing data (keep header)
      catSheet.clearContents();
      catSheet.appendRow(["Category", "DefaultMarkup"]);

      catData.forEach(cat => {
        catSheet.appendRow([cat.name, parseFloat(cat.markup) || 10]);
      });

      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }


    // ==================== saveStockChangeOnSale ====================
        if (action === "updateSoldItems") {
      const sheetUrl = JSON.parse(e.postData.contents).sheetUrl;
      const soldItems = JSON.parse(e.postData.contents).soldItems;

      if (!sheetUrl || !Array.isArray(soldItems)) {
        return ContentService.createTextOutput(JSON.stringify({success: false, error: "Invalid data"})).setMimeType(ContentService.MimeType.JSON);
      }

      const ss = SpreadsheetApp.openByUrl(sheetUrl);
      let invSheet = ss.getSheetByName("Inventory");
      if (!invSheet) return ContentService.createTextOutput(JSON.stringify({success: false, error: "Inventory sheet not found"})).setMimeType(ContentService.MimeType.JSON);

      const data = invSheet.getDataRange().getValues();
      const headers = data[0];
      const barcodeCol = headers.indexOf("Barcode");
      const stockCol = headers.indexOf("StockQty");

      if (barcodeCol === -1 || stockCol === -1) {
        return ContentService.createTextOutput(JSON.stringify({success: false, error: "Missing columns"})).setMimeType(ContentService.MimeType.JSON);
      }

      soldItems.forEach(sold => {
        const normBarcode = normalizeBarcode(sold.barcode);
        for (let i = 1; i < data.length; i++) {
          if (normalizeBarcode(data[i][barcodeCol]) === normBarcode) {
            invSheet.getRange(i + 1, stockCol + 1).setValue(sold.stockQty || 0);
            break;
          }
        }
      });

      return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
    }

    // ==================== addStock ====================
    if (action === "addStock") {
      const d = params.data || {};
      const barcode = String(d.barcode || "").trim();

      if (!barcode) {
        return ContentService.createTextOutput(JSON.stringify({error: "Barcode is required"}))
          .setMimeType(ContentService.MimeType.JSON);
      }

      const values = invSheet.getDataRange().getValues();
      let rowIndex = -1;

      for (let i = 1; i < values.length; i++) {
        if (String(values[i][0] || "").trim() === barcode) {
          rowIndex = i + 1;
          break;
        }
      }

      const newRow = [
        barcode,
        d.name || "",
        Number(d.cost) || 0,
        d.category || "Other",
        Number(d.customMarkup) || 0,
        Number(d.stockQty) || 0,
        Number(d.minStockLevel) || 5,
        d.expiryDate || ""
      ];

      if (rowIndex !== -1) {
        invSheet.getRange(rowIndex, 1, 1, newRow.length).setValues([newRow]);
      } else {
        invSheet.appendRow(newRow);
      }

      return ContentService.createTextOutput(JSON.stringify({success: true}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ==================== importMaster ====================
    if (action === "importMaster") {
      const MASTER_ID = "13prRL18YKQ9sFE7zID4kmSDTOaQuD1Z6ffZUnHgJrw0";
      const masterSS = SpreadsheetApp.openById(MASTER_ID);
      const masterTab = masterSS.getSheetByName("Master") || masterSS.getSheets()[0];

      const data = masterTab.getDataRange().getValues();
      const items = data.slice(1).map(row => ({
        barcode: String(row[0] || ""),
        name: String(row[1] || ""),
        cost: 0,
        category: String(row[2] || "Other"),
        customMarkup: 0,
        stockQty: 0,
        minStockLevel: 5,
        expiryDate: ""
      })).filter(item => item.barcode);

      return ContentService.createTextOutput(JSON.stringify(items))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({error: "Invalid action"}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    console.error("doPost error:", err.toString());
    return ContentService.createTextOutput(JSON.stringify({error: err.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}keep
