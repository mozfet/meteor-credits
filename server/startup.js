import moment from 'moment';
import CreditsApi from './api.js';
import Access from '/imports/api/access';

// before credit insert
Credits.before.insert(function (userId, doc) {

  // set owner id
  doc.ownerId = userId;

  // set initial state
  doc.state = 'CREATED';

  // set creation and update time
  doc.createdAt = doc.updatedAt = moment().format();
});

// before payment update
Credits.before.update(function (userId, doc, fieldNames, modifier, options) {

  // set update time
  doc.updatedAt = moment().format();
});

// publish credits to admin and owners
Meteor.publish('mozfet:credits', function () {
  const userId = Meteor.userId();

  // if user is admin
  if(Access.isAdmin(userId)) {

    //publish all credits
    return Credits.find({});
  }

  // all other users
  else {

    // publish all payments user owns
    const credits = Credits.find({ownerId: userId});
    return credits;
  }
});

// allow only admin access to credits on clients
Credits.allow(Access.adminCreateUpdateRemove);

//remote procedure calls
Meteor.methods({
  'payments.credits.create': CreditsApi.create,
  'payments.credits.transfer': CreditsApi.transfer,
  // 'payments.credits.balance:': CreditsApi.balance
});
