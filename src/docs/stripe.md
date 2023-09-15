<pre>
*** products

(*) pay as you go
	- name: Pay as You Go
	- description: This is for individuals or teams looking to do a small number of document processing. Pricing is charged at just 50p/document and billed at the end of the month.
	- additional information
		; unit label: Page
		; metadata:
			> No monthly fee, Pay as you go
			> Custom Construction Delivery Ticket Models
			> Document Cloud Storage 
			> Automated data extraction 
			> On Site and Offset construction documents 
			> Automatically organised delivery ticket data
			> Download and export your data
			
	- price
		; model: package pricing
		; price: 0.50 gbp per 10 units
		; recurring
		; daily(testing) - monthly(live)
		; usage is metered
		; sum of usage values during period
		; this is default price
	
(*) Machine company 2 (enterprise company)
	- name: Machine Company 2
	- description: For companies to looking to transform into Machine Companies. Automate time-draining tasks with advanced construction AI document processing. 5,500 pages, then £0.2/page
	- additional metadata
		; unit label: Page
		; metadata:
			> Includes 5,500 pages per month
			> Custom Construction Delivery Ticket Models
			> Custom Document Model Request 
			> Document Cloud Storage 
			> Automated data extraction 
			> On Site and Offset construction documents
			> Unlimited Number Of Sites and Users
			> Power BI Templates
			> Carbon Emissions Engine
			> Material Engine
			> Plant Engine
			> Tool and PPE Engine 
			> 60 Day Money Back Guarantee 
			> Cancel Anytime
			> 1 Tree Planted per month
	- price
		; model: standard pricing
		; 1359 gbp per day(testing) / month(live)
		; recurring
	
(*) Enterprise automation(Contact sale)
	- name: Enterprise Automation
	- description: Typically for multinational companies looking to automate thousands of documents per day.
	- no price

(*) from testing to prod
	- update interval day to month for contact sale
		Go to line 101 of saleRequest.controller.ts
	- update free trial limit.
		Go to line 11 of /constants/subscriptionResourceKey
	- update interval of machine company subscription
		In stripe
	- update customer portal in stripe setting.
	- update number of extraction for every subscription
		In database(subscriptionResource table)

(*) Enable webhooks
</pre>