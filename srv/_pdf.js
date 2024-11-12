const { month, year } = require('@cap-js/hana/lib/cql-functions');
const cds = require('@sap/cds');
const _ = require('underscore');

let _loadPDFData = async function (req, srv) {
  try {
    const tx = cds.transaction(req);
    const { Month,Category } = srv.entities;
    const oParam = req.data
    const monthData = await tx.run(
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
        const grandTotal = _.reduce(categoryData, (sum, item) => sum + item.total_amount, 0);


    return {
        monthData: monthData,
        categoryData: categoryData,
        grandTotal: grandTotal
    }
  } catch (error) {
    req.error(error)
  }


}

let generatePDF = async function (req, srv) {
    try {
        const pdfData=await _loadPDFData(req,srv);
        return {
            message:'PDF data using generatePDF',
            pdfData:pdfData
        }
    } catch (error) {
      req.error(error)
    }
  
  
  }

module.exports = { generatePDF }