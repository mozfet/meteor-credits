import moment from 'moment'
import { Mongo } from 'meteor/mongo'
import { check } from 'meteor/check'

export const events = {
  BUY_CREDITS: 'BUY_CREDITS',
  SPEND_CREDITS: 'SPEND_CREDITS',
  WITHDRAW_CREDITS: 'WITHDRAW_CREDITS'
}

export const credits = new Mongo.Collection('mozfet_credits')

/**
 * Find all credits
 * @param {}  -
 * @returns {}
 **/
export function totalCredits (userId = Meteor.userId()) {
  return Credits.find({ownerId: userId}).count()
}

/**
 * Find available credits in the created state
 * @param {}  -
 * @returns {}
 **/
export function availableCredits (userId = Meteor.userId()) {
  return Credits.find({ownerId: userId, state: 'CREATED'}).count()
}

/**
 * Find all recieved credits that have been transferred and not paid out
 * @param {}  -
 * @returns {}
 **/
export function recievedCredits (userId = Meteor.userId()) {
  return Credits.find({
    ownerId: userId,
    state: {$in: ['TRANSFERRED', 'PAIDOUT']}
  }).count()
}

/**
 * Find all credits that were paid out
 * @param {}  -
 * @returns {}
 **/
export function paidoutCredits (userId = Meteor.userId()) {
  return Credits.find({ownerId: userId, state: 'PAIDOUT'}).count();
}

/**
 * Find the number of credits available for payout
 * @param {}  -
 * @returns {}
 **/
export function availableCreditsForPayout(userId = Meteor.userId()) {
  return Credits.find({ownerId: userId, state: 'TRANSFERRED'}).count();
}

/**
 * Sync function that transfers credits between users.
 * Automatically creates a payment for the transfer
 * @param {}  -
 * @returns {}
 **/
export function transferCredits(senderId, recieverId, amount, meta) {
  Log.log(['information', 'payments', 'credits'], 'transfer credits', [senderId, recieverId, amount, meta]);

  // if sender is not current user
  if(senderId !== Meteor.userId()) {

    // throw error "unauthorised user"
    throw new Meteor.Error('unauthorised user');
  }

  // get cursor for available credits of sender
  if (amount>0) {
    const availableCreditsQuery = {
      ownerId: senderId,
      state: 'CREATED'
    }
    const availableCreditsQualifier{
      limit: amount,
      $sort: {expiresAt: 1}
    }
    const creditsCursor = Credits.find(availableCreditsQuery,
        availableCreditsQualifier)

    // get credit count for sender
    const senderCreditCount = creditsCursor.count();
    Log.log(['debug', 'payments', 'credits'],
      'Credit cound for user:', senderCreditCount);

    // if payer has enough credits
    if(senderCreditCount >= amount) {

      // update credits to new owner
      Credits.update(availableCreditsQuery,
          {$set: {ownerId: recieverId, state: 'TRANSFERRED', paymentId})

      // create payment
      const paymentId = payments.insert({
        type: 'CREDITS',
        senderId: senderId,
        recieverId: recieverId,
        meta: meta,
        state: 'SETTLED',
        credits: creditsCursor.fetch()
      });
      Log.log(['information', 'payments', 'credits'], 'payment settled');
    }
    else {
      Log.log(['error', 'payments', 'credits'], 'not enough credits');
    }
  }
  // else
  else {
    Log.log(['information', 'payments', 'credits'], 'transaction amount is zero, thus no payment is started');
  }
}

export default {
  credits: credits,
  total: totalCredits,
  available: availableCredits,
  recieved: recievedCredits,
  paidout: paidoutCredits,
  transfer: transferCredits,
  availableForPayout: availableCreditsForPayout
}
