// imports
import { Template } from 'meteor/templating'
import Credits from '../both/credits.js'
import './credits.html'

// export credits collection for use in client code
export {credits}

// on created
Template.showIfSufficientCredits.onCreated(() => {
  const instance = Template.instance()
  instance.subscribe('mozfet:credits')
})

// helpers
Template.showIfSufficientCredits.helpers({
  show() {
    const data = Template.currentData()
    return isSubscribed(Meteor.userId(), data.productCode)
  }
})

// on created
Template.creditsAvailable.onCreated(() => {
  const instance = Template.instance()
  instance.subscribe('mozfet:credits')
})

// helpers
Template.creditsAvailable.helpers({
  amount() {
    const data = Template.currentData()
    return Credits.available()
  }
})

// on created
Template.creditsRecieved.onCreated(() => {
  const instance = Template.instance()
  instance.subscribe('mozfet:credits')
})

// helpers
Template.creditsRecieved.helpers({
  amount() {
    const data = Template.currentData()
    return Credits.recieved()
  }
})
