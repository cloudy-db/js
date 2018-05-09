# RunNumber (走數)
An application to track travel expenses, across all currencies.

## Bill Interface
A `Bill` is an expense made for the travel. Perhaps it could be the fee of eating out, or the cost of a plane ticket.

It has a [fixed interface](https://gitlab.com/csci4140/js/blob/0a2e8732/src/RunNumber.js#L20). Note that you don't have to set something in `_id` if you are creating a new bill.

## Import
For ES6 folks, please do:

```js
import { RunNumber } from "cloudy";
```


## Initialization
First, create an instance of RunNumber

```js
const runNumber = await RunNumber.create({
	namespace: undefined,
});
```

Notice the `namespace` attribute. It is useful to specify the "group" the user belongs to. So all users in the group will have the same namespace.

You should find some external signaling (e.g. QR code) to ask the user to pass the namespace between group members.

But let's forget it for now, and just use a random namespace such as `testing`.

## Getting Activities (i.e. all the bills)
To do so, call `runNumber.query()`. It will return an array of bills, like this:

```js
[{ amount: 12345,
  currency: 'fun',
  time: 2018-05-03T11:52:25.448Z,
  name: 'Isaac2',
  comment: 'nice',
  _id: '3ca736ed-54bc-40c1-aee0-158b927a9ebb' },
{ amount: 12345,
  currency: '0e62d43e-08d3-4cb4-a1a5-62bbf2e1be82',
  time: 2018-05-03T11:52:25.275Z,
  name: 'Isaac',
  comment: 'cool',
  _id: '6b270b7a-86ee-4005-8e75-b68a7bd1170a' },
{ amount: 12345,
  currency: 'fun',
  time: 2018-05-03T10:24:19.327Z,
  name: 'Isaac',
  _id: '7739860b-06c0-4385-9d8d-fecfc54d7cb0' },
{ amount: 12345,
  currency: 'fun',
  time: 2018-05-03T10:23:38.116Z,
  name: 'Isaac',
  _id: '75b5f71e-6a2a-4020-ad84-de06b63d4215' },
{ amount: 12345,
  currency: 'e3002e4a-3cdb-4618-a446-3f1dc31a47a3',
  time: 2018-05-03T10:22:49.017Z,
  name: 'Isaac',
  _id: '12969245-f08b-4678-9c26-caa8359eb971' },
{ amount: 12345,
  currency: 'fun',
  time: 2018-05-03T09:24:54.096Z,
  name: 'Isaac',
  _id: '1c5dcda5-78d1-4c3b-93e5-2201bbba5a19' }]
```

## Add Bills
To add a bill, call `addBill(bill)`. Do the same for edits -- make sure the `_id` field is UNCHANGED for edits.