# Meteor Payment Subscriptions

Extends mozfet:payments with subscription micro payment using credits.

## Install
```
$ meteor add mozfet:credits
```

## Client - Usage
This example will show a buy button to buy credit

Buy Button - Blaze Template JavaScript:
```js
import 'meteor/mozfet:materialize-payments'
import 'meteor/mozfet:subscriptions'

Template.myTemplate.helpers({
  transactionBuyCredits() {
    const instance = Template.instance()
    return {
      amount: 7,
      currency: 'EUR',
      productCode: '50-CREDITS',
      meta: {
        credits: {
          validity: {  // any valid arg for use with moment.duration(arg)
            years: 1,
            months: 6
          },
          amount: 50,
          type: 'NORMAL'
        }
      },
      texts: {
        'product-name': '50 Normal Credits',
        'buy-button': 'Buy 50 Credits'
      }
    }
  }
})
```

Buy Button - Blaze Template HTML:
```html
<template name="myTemplate">
  {{>buyButton transactionBuyCredits}}  
</template>
```

Amount of Credits for Display to User:
```html
{{>creditsAvailable}} {{>creditsRecieved}}
```

## Server - Usage
```js
import Credits from 'meteor/mozfet:credits'
const availableCredits = Credits.available(userId)
const recievedCredits = Credits.recieved(userId)
```
