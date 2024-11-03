const cds = require('@sap/cds');

const { _onBeforePOST} = require("./_month");

module.exports=cds.service.impl(srv=>{
    srv.before(['CREATE','UPDATE'],'Month',async (req)=>await _onBeforePOST(req,srv))
})