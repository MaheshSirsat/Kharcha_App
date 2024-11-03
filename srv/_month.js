const cds = require('@sap/cds');

let _onBeforePOST=async function(req,srv){
        req.data.total_Balance=req.data.credit_Balance + (req.data.previous_Balance || 0)
}

module.exports={ _onBeforePOST}