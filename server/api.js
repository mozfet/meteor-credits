

// const balance = (userId) => {
//   if(userId && !Access.isAdmin()) {
//     // log and throw error
//     Log.log(['error', 'credits'], 'access denied');
//   }
//   userId = userId?userId:Meteor.userId();
//   const result = Credits.find({ownerId: userId}).count();
//   Log.log(['information', 'credits'], 'credit balance: '+balance);
//   return result;
// };

// default export
export default {
  create: create,
  transfer: transfer,
  // balance: balance
};
