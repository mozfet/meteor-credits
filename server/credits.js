// imports
import moment from 'moment'
import { check } from 'meteor/check'
import { _ } from 'meteor/underscore'
import { emitter, events as paymentEvents
    } from 'meteor/mozfet:materialize-payments'
import {
    credits, availableCredits, recievedCredits,
    events as creditEvents
  } from '../both/credits.js'

// export events, isSubscribed and subscriptions
export const events = {}
_.extend(events, paymentEvents, creditEvents)
export {credits, availableCredits, recievedCredits}

// handle payment approved event
emitter.on(paymentEvents.PAYMENT_APPROVED, payment => {
  Log.log(['debug', 'payments', 'credits', 'events'],
      `Payment ${payment._id} was approved.`)
  const buyCredits = payment.meta && payment.meta.credits?
      payment.meta.credits:undefined
  if (buyCredits) {
    const doc = {
      ownerId: payment.ownerId,
      paymentId: payment._id,
      createdAt: new Date()
    }
    if (buyCredits.validity) {
      const duration = moment.duration(buyCredits.validity)
      Log.log(['debug', 'payments', 'credits'],
          `validity of about ${duration.humanize()}`)
      doc.validity = byCredits.validity
      doc.expiresAt = moment(doc.createdAt).add(doc.duration).toDate()
      Log.log(['debug', 'payments', 'credits'], `expiration date`,
        doc.expiresAt)
    }
    if (payment.productCode) {
      doc.productCode = payment.productCode
    }
    doc._id = credits.insert(doc)
    emitter.emit(creditEvents.BUY_CREDITS, doc)
  }
  else {
    Log.log(['debug', 'payments', 'credits'], `non credits payment`)
  }
})

// handle subscription event
emitter.on(subscriptionEvents.BUY_CREDITS, doc => {
  Log.log(['debug', 'payments', 'credits', 'events'],
      `On sucess of Buy Credits:`, doc._id)
})

// sync function that creates credits in response to another type of approved payment
const create = (paymentId, userId, amount, validityDurationDays, value) => {
  const now = moment();
  const validUntil = now.add(validityDurationDays, 'days');
  const doc = {
    state: 'INITIAL',
    ownerId: userId,
    paymentId: paymentId,
    createdAt: now.format(),
    validUntil: validUntil.format(),
    value: value
  };

  Payments.update(paymentId, {$set: {state: 'CLEARING'}});
  for(let i = 0; i < amount; i++) {
    const creditId = Credits.insert(doc);
    // Log.log(['information', 'payments', 'credits'], 'inserted credit id', creditId);
    const credits = Credits.find({_id: creditId}).fetch();
    // Log.log(['payments', 'credits'], 'inserted credit', credits);
  }

  Payments.update(paymentId, {$set: {state: 'SETTLED'}});
  Log.log(['information', 'payments', 'credits'], 'created '+amount+' credits for payment'+paymentId);

  const credits = Credits.find({paymentId: paymentId}).fetch()
  Log.log(['information', 'payments', 'credits'], 'credits', credits)
}

// publications
Meteor.publish('mozfet:credits', function () {
  if (this.userId) {
    const cursor = subscriptions.find({ownerId: this.userId})
    Log.log(['debug', 'subscriptions', 'publish'],
      `Publish ${cursor.count()} product subscriptions to user ${this.userId}.`)
    return cursor
  }
  else {
    Log.log(['debug', 'subscriptions', 'publish'],
      `No product subscription for undefined user.`)
    this.ready()
  }
})
