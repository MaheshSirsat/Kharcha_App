const cds = require('@sap/cds');
const _ = require('underscore');
const axios = require('axios');
const { getDestination } = require('@sap-cloud-sdk/connectivity');
let _loadPDFData = async function (req, srv) {
  try {
    const tx = cds.transaction(req);
    const { Month,Category } = srv.entities;
    const oParam = req.data
    let monthData = await tx.run(
        SELECT.from(Month).columns(
            ((cMonth) => {
                cMonth('*'),
                    cMonth.to_Items((cItems) => {
                        cItems('*')
                    })
            })
        ).where({
            month_name: oParam.month_name,
            year: oParam.year
        }));



        const categoryData = _.map(
            _.groupBy(monthData[0].to_Items, 'to_Category_name'),
            (items, category) => ({
                category,
                total_amount: _.reduce(items, (sum, item) => sum + item.amount, 0)
            })
        );
        monthData=await _cleanValue(monthData)
        const grandTotal = _.reduce(categoryData, (sum, item) => sum + item.total_amount, 0);
        const current_Balance=monthData[0].total_Balance-grandTotal


    return {
        monthData: monthData,
        categoryData: categoryData,
        current_Balance:current_Balance,
        grandTotal: grandTotal
    }
  } catch (error) {
    req.error(error)
  }


}

let _cleanValue = async function (monthData) {
  monthData[0].to_Items.forEach((item) => {
    ['name', 'remarks', 'amount', 'category'].forEach((field) => {
      if (item[field] === null || item[field] === undefined || item[field] === '') {
        item[field] = " ";
      }
    });
  });
  return monthData; 
};
let generatePDF = async function (req, srv) {
    try {
        const pdfData=await _loadPDFData(req,srv);
        const destinationName = 'Kharcha_PDF';
        const destination = await getDestination({ destinationName });
        const destinationUrl = destination.url;
    
        const pdfGenerationUrl = `${destinationUrl}/generatePDF`;
    
        const response = await axios.post(pdfGenerationUrl, pdfData, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
    
        const base64PDF = response.data.PDF_base64;
        return base64PDF;
        
    } catch (error) {
      req.error(error)
    }
  
  
  }

module.exports = { generatePDF }