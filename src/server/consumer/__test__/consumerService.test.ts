//@ts-nocheck
export default {};

/**
 * subscription canceling a plan
 *  - what happens to existing orders...? and their invoices...?
 * 
 * cancelation occurs immediately and stops any upcoming "subscription" payments, but manually created invoice items
 * tied to that subscription, namely adjustments, will still be charged. so we need to make sure to account for those.
 * 
 * there are currently 3 possible adjustment invoiceItems given current week of n1. see the subscription plan change to
 * see why these are the only possible adjustment invoiceItems
 * 
 * invN0 (prev week)
 * invN1 (this week)
 * invN2 (next week)
 * 
 * let's look at each of these invidivudally and see if we need to delete them
 * 
 * invN0
 *  - this exists when the previous week's plan was updated after already having paid for it. ex:
 *  today is 3/19. payment and confirmation is 3/22. so we update delivery to 3/27. On 3/22 we pay for plan. On 3/23,
 *  we update plan. this creates and invoice for 3/29 for to adjust the previous week's 3/22 payment.
 * 
 * invN1
 *  - this exists when the current week's plan was updated before payment of this week. this can happen immediately
 *  after another payment. ex: today is payment + confirmation date of 3/22. food arrives on 2/24. next paymentment
 *  and confirmation is 3/29, but on 3/25, we update the plan, which creates an adjustment invoice for 3/29.
 * 
 * invN2
 *  - yes. delete this because the consumer wont get food for week n2.
 * 
 * So simply deleting invN0 in any case will cause problems because we need, we need it to adjust for the previous payment.
 * Say the consumer previously paid $150 in and then they cancel, they need need to be re-invoiced -150 so they
 * get their money back. At first it may seem possible to just skip the orders and let that logic handle the adjustment
 * invoice items THEN cancel after skpping. But this is problematic because we'll end up giving consumers money if
 * the adjustments is for a week that hasn't been paid for yet. ex: today is 3/22 and next payment is 3/28. if consumer
 * updates from $40 to skip, then a -$40 is created. so once we cancel, we'll pay the consumer -$40 which is bad. So
 * the only time we want to "skip" is for when the order has already been paid for. otherwise if the order has not been
 * paid for, then we delete the invoice item
 * 
 * but is it possible to have invoiceItems in the upcoming payment that are not tied to O1 or O2? let's imagine
 * invN0 was tied to O0. this means that invN0 is tied to an order that was already delivered (since O1 and O2 are
 * upcoming undelivered orders). and well if invN0 was tied to a delivered order and delivered orders are paid for, then
 * invN0 wouldn't actually be invN0 since by definition invN0 is an adjustment invoiceItems for the upcoming,
 * unpaid invoice. same logic applies to invN1.
 */

/**
 * stripe subscription, change the plan
 *  - what happens to the existing orders....? and their invoices...?
 * 
 * here are the possible states based on invoices where n1 = next payment and n2 = nextnext payment
 * 
 * assuming we always update current week.
 * 
 * n1 = planN1(40) + invN1(80[upgrade n1 to 80] - 40 [n1plan] = 40))
 * 
 * n1 = planN1(40) + invN0(0[upgrade n0 to skip] - 80[n0plan + n0inv]= -80)
 * 
 * n1 = planN1(40) + invN0(0[upgrade n0 to skip] - 80[n0plan + n0inv] = -80) + invN1(80[upgrade n1 to 80] - 40[n1plan] = 40)
 * 
 * n1 = planN1(40) + invN0(0[upgrade n0 to skip] - 80[n0plan + n0inv] = -80)
 * 
 * n1 = planN1(40) + invN0(0[upgrade n0 to skip] - 80[n0plan + n0inv] = -80) + invN1(80[upgrade n1 to 80] - 40[n1plan] = 40)
 * 
 * so up to this point... n1's invoice is planN1 + inv0 + inv1. what if we start updating nextnext week?
 * 
 * n1 = planN1(40) + invN2(150[upgrade n2 to 150] - 40[n2Plan] = 110)
 * 
 * n1 = planN1(40) + invN1ThatWasPaidInN0(0[upgrade n1 to skip] - 150[n1plan + invN1ThatWasPaidInN0 [40 + 110]] = -150 )
 * 
 * so n1's invoice is planN1 + invN0 + invN1 + invN1ThatWasPaidInN0 + invN2
 *
 * now what happens when i change plans permaanenlty? firstly, i dont need to worry about nextnext week
 * aka, i only need to worry about upcoming invoice. so let's break up each variable
 * 
 * planN1 = planN1, nuff said
 * invN0 = newN0Plan - (n0Plan + n0inv)
 * invN1 = newN1Plan - n1Plan
 * invN1ThatWasPaidInN0 = newN1Plan - (n1Plan + n1inv)
 * invN2 = newN2Plan - n2Plan
 * 
 * note that inv1 = invN1ThatWasPaidInN0 =  newN1Plan - (n1Plan + 0) so we can redefine fn as...
 * 
 * paymentN1 = planN1 + invN0 + invN1 + invN2 where...
 * 
 * planN1 = planN1, nuff said
 * invN0 = newN0Plan - (n0Plan + n0inv)
 * invN1 = newN1Plan - (n1Plan + n1inv)
 * invN2 = newN2Plan - n2Plan
 * 
 * 
 * now that we have this. ask agian, what happens when i change plans permanently? doing so won't change upcoming
 * adjustments as they are 1-time sets, but it does change the existing plan, aka planN1. but i can't leave the
 * invNX alone since they were calculated based on the wrong plans. so they need to be updated. lets go through each
 * 
 * planN1 = planN1 -> auto updated
 * invN0 = newN0Plan - (n0Plan + n0inv) -> leave as is because (n0Plan + n0Inv) was true at the time when invN0 was calculated
 * invN1 = newN1Plan - (n1Plan + n1inv) -> needs to be recalculated by updating n1Plan and n1Inv
 * invN2 = newN2Plan - n2Plan -> needs to be recalculated by updating n2Plan
 * 
 * to update invN2, i can just store the individual variables in metadata. then
 * use them to recalculate.
 * 
 * to update invN1, that's a little more tricky since even if i store individual variables in metadata,
 * i can't just update n1plan and recalculate since n1inv needs to be updated to, but it's unclear how
 * to update it since its value is based on old data. if it was just invN1 = newN1Plan - n1Plan, then itd be easy.
 * this is the case when i update the current week. n1inv becomes a variable because of invN1ThatWasPaidInN0.
 * 
 * let's look closer at updating nextnext week scenario and look for pattern.
 * 
 * n1 = planN1(40) + invN2(150[upgrade n2 to 150] - 40[n2Plan] = 110)
 * ---- then time passes into n2. this triggers payment of n1 for planN1(40) + invN2(110) = 150. now n2 is the new n1 ----
 * n1 = planN1 + invN1
 *    = 40 + (newN1Plan - (n1Plan + n1inv))
 *    = 40 + (0 - (40 + 110))
 *    = 40 + (-150)
 *    = -110
 * 
 * what happens if i PERMANENTLY update the plan now to 80? consumer should still pay -110 since n1 is currently
 * skipped and -110 covers the overpayment of 110 from n0. whats the equation here?
 * 
 * ------- if i use the newest invN1--------
 * n1 = planN1 + invN1
 *    = 80 + (newN1Plan - (n1Plan + n1inv))
 *    = 80 + (0 - (80 + (-150))
 *    = 80 - (-70)
 *    = 150
 * 
 * ------- if i use the previous invN1 --------
 * n1 = planN1 + invN1
 *    = 80 + (newN1Plan - (n1Plan + n1inv))
 *    = 80 + (0 - (80 + 110)
 *    = 80 - (190)
 *    = -110
 * 
 * we get the desired payment for n1 when we used the not the current invN1, but the previous invN1. let's updating
 * to 150 with previous invN1
 * 
 * n1 = planN1 + invN1
 *    = 150 + (newN1Plan - (n1Plan + n1inv))
 *    = 150 + (0 - (150 + 110))
 *    = 150 - 260
 *    = -110
 * 
 * we get the same value again! so the trick here is, if invN1 exists, grab the invN1 that was used to calculate the
 * existing invN1 and use that for our calculations. intuitively why does this work?
 * 
 * n1 = n1Plan + (newN1Plan - (n1Plan + n1inv))
 *    = n1Plan + (newN1Plan - n1Plan - n1inv)
 *    = n1Plan + newN1Plan - n1Plan - n1Inv
 *    = newN1Plan - n1Inv
 * 
 * notice that the n1Plan's cancel out so they don't really affect the final payment. of course, we don't have the
 * luxury of simplifying as we dont fully control the payments. stripe will always charge n1Plan and so, it makes
 * sense that we have to create adjustments that account for that.
 * 
 * 
 * So in summary, here's the plan. when i make an invoiceItem, be sure to add in meta the variables used to create it
 * Then, i need to check if these invoiceItems exist, and if they do, update them
 * 
 * invN1 = newN1Plan - (n1Plan + n1inv) -> needs to be recalculated by updating n1Plan and n1Inv
 *    - this can be found by targetOrderInvoiceDate = upcomingOrders[0].invoiceDate
 *    then finding all lineItems with targetOrderInvoiceDate. then we go into these line items and
 *    and grab meta data and update them with new value using new subsricption plan and meta
 * 
 * invN2 = newN2Plan - n2Plan -> needs to be recalculated by updating n2Plan
 *  - find the invoiceItems that come after targetOrderInvoiceDate. then we go into these line items and
 *    and grab meta data and update them with new value using new subsricption plan and meta
 * 
 * 
 * 
 */