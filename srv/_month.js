const cds = require('@sap/cds');

let _onBeforePOST=async function(req,srv){
        if(req.data.credit_Balance){
                req.data.total_Balance=req.data.credit_Balance + (req.data.previous_Balance || 0)
        }
}

let _onBeforeDELETE=async function(req,srv){
        const tx = cds.transaction(req);
        const { Category } = srv.entities; 
        const consumedData=await tx.run(
                SELECT.from(Category).columns(
                        ((col) => {
                            col('*'),
                                col.to_Item((actLog) => {
                                    actLog('*') 
                                })
                        })
                    ).where({
                    name:req.data.name
                }));
        if(consumedData[0].to_Item.length){
                req.error( `Unable to Delete.This Category Associated with another Month`);
        } 
}

module.exports={ _onBeforeDELETE,_onBeforePOST}