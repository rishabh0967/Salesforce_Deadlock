public with sharing class startQueueableDelete implements Queueable{

    public void execute(QueueableContext qc) {
        executeQueue(qc.getJobId());
    }

    private static void executeQueue(Id exportedRecordId)
    {
        try
        {
            ExportedRecord__c record = queryExportedRecord(exportedRecordId);
            if(record == null)
                return;
            DealerServiceContractHelper.processDealerServiceContracts(record);
        }
        catch(Exception e){
            ExceptionLogHelper.logException(e);
            throw e;
        }
    }

    private static ExportedRecord__c queryExportedRecord(Id recordId)
    {
        return[
            SELECT
                Id,
                Name,
                LookupFieldId__c,
                RecordId__c
            FROM
                ExportedRecord__c
            WHERE
                ApexJobId__c =: recordId
        ];
    }
}