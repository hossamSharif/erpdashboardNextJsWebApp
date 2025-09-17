you are an expert software , expert i developing  multi langauge webapps mobile first design ,you  updated with vibe coding  .

your goal is write an prd for a simple accounting  app manage accounting for spare part shop during the financial year  for manage many shops of spare part ; there are 2 type of users . the admin (owners of those shops) , and users is the workers that work i those shops . 

the app will use to track the banks balance  and cash in hand balance for shops during the financial years and get the Profit margin  , so for each shop the admin will define  Opening Stock and Ending Stock . from those variables he can get the profit margins 
also the admin app will use it to monetring the users which is use must send daily report to the admin



 the main accounts type that  must (those accounts will be define in the database and it will just appear for the admin later in a drop down list  when admin wanna add accounts of the shops)
    sales account (payable)
    purchase account (recivable account)
    account recievable  (customers debitors)
    account payablable (suppleir cridetors)
    expenses 
    assests (cash or save)
    banks  
   * for oppeninig stock and endding stock recommend the proper names is accountting approach 
    

 when admin create a new shop must  creat sub accounts from the main account for the new shop including the and naming it clearly by add suffix of the shop name  
    
   sales-shop1 (the main account will be sales )
   purchase-shop1 (the main account will be purchase )
   expenses-shop1 (the main account will be expenses )
   customers-shop1 (account payable)
   suppleir-shop1 (account receivable) 
   cash account -shop1 
   bank account-shop1 
   
   * also he must define the account of  stock value and set the opning balance of it   and he can control the ending stock  values

   * for customers and suppleir  account the admin must add a first account (direct-sales-shop1 , direct-purchase-shop1)  which it will be the selected by default when user wanna add sales/purchase invoice for customers and supplier 

   * expenses sub accounts in shops must categories so that category will use later to filter and sort and also to preview analytic reports (salaries , breakfast , )

 the user (shop worker) can create i another level sub accounts  for the shope which it will a sub acounts from the main accounts that admin spicify the for the each shop  : for example 
    -ahmed-shop1 is sub account from the supplier-shop1   which is a sub account from the account payable
    -moh-shop1 is sub account from the customrers -shop1  which is a sub account from the account receivable  
    -dailybreakfast-shop1  its a sub account from the expenses-shop1  which is a sub account from the account expenses

the other accounts (sales-shop1 and purchase-shop1 and expenses-shopw and cash account-shop1 and bank-account shop1 and opening-stock-shop1 and endingstock-shop1) the user in shop can not create a sub account from it and it only control by tge admin 


 - calculate the profit each shope in spicific financial year  will calculate  based on balances of the accounts of the shop   (Ending Stock , Opening Stock , sales , purchase , expenses , ... any extra entry type depend on it nature (debit or credit )) by performing best accounting formula 
 - also the calculating of profit can be done for all shops in spicific year or in all years  in same way 
 - naming accounts must be have english name and arabic name 


- users of the shop must add daily entries for accounts

    -sales total  for specific   

    -purchase total in specific day  
        - for daily  sales and purchase entries user will add the invoice total , 
            -invoice can paid fully  or partial paid ; so there will be 2 feilds one of then for the cash paid and the  another to change 
            - user must spicify the customer/suppleir which by default will be (direct-sales-shop1/ direct-purchase-shop1)
            - invoice has optional comment
            - payment bank or cash must be spicify (this must effect the bank-shop1/cash-shop1 )

    - expenses daily entry  

    - there are a spicific type of entry : Allow internal transfers between Cash in Hand and Bank (vice versa). so when user do it the bank balance will effect and cash in hand balance will effect .
- user must send a daily report to the admin in spicific  time of day (daily entries) and he must notify when missed send it 
- 
 
  features : 
1- offline and online mode with daily sync 
   - the app must auto detect for network status if there are no network connection it will show dialog for user to change mode to offline mode 
   - user can also switch between online and offline mode manualy 
   - sync also will be auto and manualy . the app will check if there a new  records or changes made  localy and perform sync every spicific time (user will control the spicific time from the setting page , by default will be every 60 minutes)
2- notification sys for user and admin 
    a-users 
      -notification for daily entry record : (user must notify when he dont add any entry for today)
      -notification for sync ( user must notify when there are no any sysnc performed in that day)
      - recommend other notifications that help user shop 
    b-admin 
        -notify by adding/editing / deleting  entry from the spicific user in spicific shop 
        -notify when user change passord or email 
        -notify when user logged in and out 
        -when user missed sync for spicific period 
        -when user missed not add daily entry for today (admin can set when he would notify (time in the day) in case  user in shop not add any entry during a day )
        - recommend other notifications that help admiin to manage shop 
3- users logs 
    logs users actions (entry actions add/modify/delete , login and log out , sync performed , change email or password ...so on)
4- multi currency : this for admin only , the multi currency system work as following :
   - it is for preview the totals in selected currency 
   - the main currency is sdg (sudanese pound) , so a the rate of other currenccies to the sudanese bound must spicifiy daily 
   - in case no rate spicify in spicific date the last rate store will be the rate of the selected currncy to sdg 
   - in all pages of admin the currency switcher must be available 
   


admin
- manage  shops  
- manage  users shop
- manage financial year by add /modify the record for it  
- manage  accounts : for each shop 
      - admin must add the sotck val account and set it oppeing balance in spicific year also must have a way to spicify the value of ending stock to help in get the profit in the end of the finantial year 
      - also he must add the bank account and cash account and spicicfy the oppening balance  
      - add the default account of supplier (direct-purchase-shop name )  and default account for customers(direct-sales-shopname) , also he must  add account for sales-shopname and purchase-shopname and set it's oppening balance also 
      - add sales account and purchase account for each shop financial year (sales-shop1 , purchase-shop1)
      

      -manage currencies : the sdg is the default currency 
        -add/modify curresncy 
        - must add/modify the rates for the spicific currencies to the sudanees pornd ( 1 $ = 3500sdg) 
 -manage notifications :   
     -notify by adding/editing / deleting  entry from the spicific user in spicific shop 
        -notify when user change passord or email 
        -notify when user logged in and out 
        -when user missed sync for spicific period 
        -when user missed not add daily entry for today (admin can set when he would notify (time in the day) in case  user in shop not add any entry during a day )
        - notify when user missed sync for a 24 hour . 
      - admin can set the time that must notify in case not sync
      
- analytic Dashboard 

- logs of users 
-previw the sync operations that performed from users in shops 


ui/ux (mobile first desaign and reponsive with all screens )
    users 
    - daily entries page (first page must open after auth done ) 
      preview all entries of spicific day ordered descnding by  a sa following :
         -have a toolbar that provide :
           - add new entry button (when user click new entry modal will appear and when user save it the records will update )
           - datepicker to set the current date 
           - left arrow and right arrow to navigate to next or previous page of spicific date( so when user click right arrow the date will navigate to   previous date and the page will load the records of the that day and so on) moving from daily entry to another smoothly and by animiation
          
           - export and share button (that will export the daily entries of spicific day as a report) 
           - share : for share the daily report via (email , whatsapp )
         - top summry/status bar preview (chash in hand and bank balance )
         - provide an option to edit entry (entry modal will pop up so user can edit it )
         - provide an option to delete entry directly 

    - add/edit entry : the main three type of daily entry can category as following (expenses , sales/purchase ,   transfer form cash to bank or vice versa) 
      
    
    - toggle (icon only) side menue with :
      - sync button (to perform sync) 
      - notifications with budge for unread notif
      - recommend another buttons 

    - records of daily entries page : 
       - default preview will be preview all entries but grouping per day (single record for each date when user click to daily entries page (the first page that must oppen for the user when he open the app but here the date will be the selected record date) )
       - preview all entries without groupig 
       - for each record (entry) user can open it in a modal to modify 
       - after filter or search or sort user can export/share the result via email or whats app ..etc
      

    -logs page 

    -manage his profile

    - setting page 
        - sync 
        - offline and online control
        - history of sync (last sync time )
        - recommend another pages that help the users 
    
    - notifications : to preview all notifications 
   


    




