# MangoJuice
This is an experimental staff with one goal: bring the most stunning programming interface for SPA development. I inspired for this after meet with Elm and many hours of work with React + Redux + Redux-Saga stack.

## What i'm trying to achieve
1. *Highly testable* – writing tests should not be a pain, even for business logic, async operations or event handlers.
2. *Highly scalable* – it should be easy and fast to make a prototype, but it also should be possible to convert the prototype to a real application.
3. *With static type checking in mind* – types usage should be natural.
4. *Highly decomposable* – write everything in one file for a prototype, or spread across many files for real app.
5. *Less boilerplate* – write only the things that is really needed

## The Architecture
The whole thing have only 4 entities: Model, Command, View and init function. That is everything you need to know to start building you app. A module with Model, Commands, View and init function called Block. So, let's start from the Model.

### Model
Each Block have a Model. In MangoJuice Model defined using Flow type. Just like this:
```javascript
export type Model {
  name: string,
  authorized: bool
}
```
You can even omit the Model type definition, because it is just a compile time thing for static type validation. But it is strongly recommended to define the Model to make your app more understandable, even if you are not using it a lot (even for prototyping).

### Command
MangoJuice architecture based on The Elm Architecture (TEA). TEA based on well known Command Pattern architecture. So, it is better to say that MangoJuice is a Command Pattern implementation.
If you do not know what is the Command Pattern, here is [the long story](https://medium.com/front-end-developers/the-command-pattern-c51292e22ea7). But in short, the basic idea of the pattern is in commands (which is just an object that describes __what__ should be executed) that is executed by one central Executor. Any UI element on the page can produce a command and pass it to the Executor. The Executer decide when actually execute the command and in which order.

So, how commands is represented in MangoJuice?
```javascript
import { Cmd } from 'mangojuice';

export type Model {
  someField: string
}

export const Commands = {
  MyUpdateCmd: Cmd.update(({ model }, ...args) => ({
    someField: 'newValue'
  })),
  AnotherUpdateCmd: Cmd.update(({ model }, newValue) => ({
    someField: newValue
  })),
  TogetherCommand: Cmd.batch(({ model }, newValue) => [
    MyUpdateCmd,
    AnotherUpdateCmd.bindArgs(newValue)
  ])
};
```
Wow, so much new words! But do not panic! Let's meet with each of them. Command is an object with function that should be executed. There is 4 type of commands:

1. For updating the model object – `Cmd.update(...)`
2. For invoking multiple commands in sequence – `Cmd.batch(...)`
3. ... 4...

...and some other types which we will meet a little bit later. As you can see, Command is just a declaration what should be done. The first argument in a command function is always a props object which have current model object of the Block and some other useful staff, we will talk about it later. All other arguments could be passed or not passed, it is up to the caller of the command.

In the example above when `TogetherCommand` called with one argument actually will be called `MyUpdateCmd` and `AnotherUpdateCmd`. Arguments passed to `TogetherCommand` is not propagated to the child commands, so we are using special command's function `bindArgs`, it is an equivalent to `bind` of function, but for Command.

### View
It is time to connect Commands with View. View in MangoJuice is a function that returns a layout based on a model object. Currently views can be implemented using React. But it could be any other View technology, which supports views nesting and partial updates (view re-rendering without touching subviews).

```javascript
export type Model = {
  name: string
};
export const Commands = {
  SetNameValue: Cmd.update(({ model }, event) => ({
    name: event.target.value
  }))
}
export const View = ({ model, exec }) => (
  <div>
    <span>Hello, {model.name}.</span>
    <input value={model.name} onChange={exec(Commands.SetNameValue)} />
  </div>
);
```
We just defined our first almost functional Hello World Block. The view accepts props object as a first argument (just like React pure function component). In the props you can find model object special `exec` function that creates another function that could be called by any view element to produce a command and send it to the Executor. In the example above on each input change will be produced a command with one argument – input event. The command uses that event to set new name value. On each type, name in a `<span>` will be automatically changed, because view will be re-rendered.

### Init function
That is the final thing to define a complete Block – init function. The init function is used to produce initial model state for a Block. It also can define an init command that should be executed right after a model initialized.
```javascript
import type { InitModel } from 'mangojuice/types';

export type Model = {
  name: string,
  authorized: bool
};
export const Commands = {
  InitSomething: Cmd.nope()
};
export const init = (prop, ...args): InitModel<Model> => ({
  command: Commands.InitSomething,
  model: {
    name: '',
    authorized: false
  }
});
```
Congratulations, we just defined out first Block. There is no View, but Block actually can live without View. And it is a very important feature of a Block. We will see it in action a little bit later. But now let's go thorough the example.

Init function should return an object with initial model and init command (optional). Actually returned object may have some other fields, but we will see it later. So, `command` field should contain a command that will be executed with newly created model object. In the example the command is just do nothing. `model` field should have all initial values of the model (in Flow all types is non-nullable, so we defined all required fields).

The function have some weird arguments too (the props object), but we will talk about it later.

### Block – all together.
Block is a module with Model, Commands, View and init. And moreover, Block module should have exactly this interface:
```javascript
export type Model = { ... };
export Commands = { ... };
export View = () => {};
export init = () => {};
```
If some module have that interface, then it is a Block. Otherwise it is not. It could be a part of a Block if exports only View, or only Commands, but it is not a Block.

So, it is time to run our Block. For this kind of thing MangoJuice have a special `Process` module and a very special `start` function. Here it is in action:
```javascript
import { Process } from 'mangojuice';
import * as HelloBlock from './Hello';

Process.start({
  mount: docuemt.getElementById('container'),
  app: HelloBlock
});
```
Here we go! This thing just bootstrap our Block: call `init` function, execute init command, call `View` function and mount it to provided mount point. It also listen to calls of `exec` from view to execute commands. Process is an Executor in terms of Command Pattern. Any change of a model automatically rerun the view to update it reactively.

I think you noticed that the Block is very similar to just a React statefull component. And you are god damn right! But let me show you some things that you can do with Blocks.

### Nesting of Blocks
It is cool to have one Block, but what if we have an app that is big enough to have two Blocks? Or even three Blocks? Let's say we want to write really big app – multiple counter app.
```javascript
// Counter.js – for a single counter
import { Cmd } from 'mangojuice';

export type Model = {
  value: nubmer
};
export const Commands = {
  Increment: Cmd.update(({ model }) => ({
    value: model.value + 1;
  }))
};
export const View = ({ model, exec }) => (
  <div>
    {model.value}
    <button onClick={exec(Commands.Increment)}>+</button>
  </div>
);
export const init = (props, initValues = 0) => ({
  model: {
    value: initValues
  }
});
```
This is a very simple counter Block. You can run it with `Process.start` and it will show one counter with plus button. And it works, I promise. There is nothing new for you. Now let's write a Block for showing multiple counters.

```javascript
// App.js – for single counter
import { Cmd } from 'mangojuice';
import * as Counter from './Counter';

export type Model = {
  counters: Array<Counter.Model>
};
export const Commands = {
  CounterMiddleware: Cmd.middleware(),
  AddCounter: Cmd.update(({ model, nest }) => ({
    counters: [
      ...model.counters,
      nest(Counter, 10)
    ]
  }))
};
export const View = ({ model, exec, nest }) => (
  <div>
    {model.counters.map(c => nest(c, Commands.CounterMiddleware, Counter))}
    <button onClick={exec(Commands.AddCounter)}>Add counter</button>
  </div>
);
export const init = ({ nest }) => ({
  model: {
    counters: [ nest(Commands.CounterMiddleware, Counter.init) ]
  }
});
```
Hm... interesting. Now you see that props object passed to init, View and Command have one very useful function (especially for Blocks nesting) called `nest`. It helps with nesting some child view in `View` and some child model in `init` and `Command`. So, to nest one Block to another Block you should create a model for it. And that is what `nest` returns in `init` and `Command`. Then you will be able to use that model to nest block's View. `nest` in View returns React element.

That is all kind of obvious. I guess you are more interested in `Commands.CounterMiddleware`. This is another very important part of MangoJuice. When you are nesting model, you should provide to the `nest` function some middleware command, which will be invoked on every command happened in nested Block. Currently it is just a dummy middleware which not react on any command and just pass everything. Let's make something with more interesting it.
```javascript
...
export const Commands = {
  CounterMiddleware: Cmd.middleware()
    .on(Counter.Commands.Increment, (props, counterModel, counterCmd) => [
      counterModel.value > 15 && Commands.AddCounter,
      counterCmd
    ]),
    ...
```
Now on each Increment of a Counter which have a value greater than 15 new Counter will be added to the App's model. Pretty useless but now you see how it works. It is like a callback for counter increment, but without callbacks hell. I think you noticed `counterCmd` in the returned array. It is `Counter.Commands.Increment` command instance, and if you won't return it, it won't be actually executed. That simple.

In general, if you have some blocks chain `B1 <- B2 <- B3` and some command produced in B3, before to be actually executed the command will go through middleware in B1, then through B2 and only then it will be executed, if all middlewares in the chain return that command. All commands returned by middlewares will be executed after the command from B3.

That is all for nesting.

### Shared Block
Ok, but what if we need an access to some Model from any Block of the app. Let's say User model, to show or hide some controls for authorized users. In MangoJuice we have special Block type that is called shared Block. It is a regular Block but just (generally) without a View. Let's create mentioned User shared Block.
```javascript
// User.js
export type Model = {
  authorized: bool
};
export const Commands = {
  Login: Cmd.update(() => ({ authorized: true })),
  Logout: Cmd.update(() => ({ authorized: false })),
}
export const init = () => ({
  bindCommands: Commands,
  model: {
    authorized: false
  }
});
```
Really simple Block. But how it supposed to be used everywhere? `Process.start` have special field in option called `shared`. You can set shared Block to the `shared` field and you will be able to access the shared model everywhere. How? In props of `init`, `View` and any `Command` you will find `shared` field which is the model of the shared Block.

```javascript
import * as User from './User';

export const View = ({ model, shared }) => (
  <div>
    {shared.authorized
      ? <button onClick={User.Commands.Logout}>Logout</button>
      : <button onClick={User.Commands.Login}>Login</button>}
  </div>
);
```

Now take a look at `bindCommands` field in `init` function of the User block. Shared Blocks is a signletone Blocks, and this field says to the `Process` to bind each command in `Commands` to the model object. It makes possible to use that commands outside of the block. In the example above we are showing login and logout buttons. By clicking to the button will be executed appropriate command from User block.

Any Block of the app depends on changes of shared model. So, if shared block (or any sub-block of shared block) changed, then the whole app will be re-rendered. So, move to a shared block only rarely changed sub-blocks.

### Subscriptions to shared Blocks
Sometimes it is useful in some app block to know that some shared sub-block changed. For example to execute some commands by this event. Assume that we have shared block with this model:
```javascript
export type Model = {
  user: User.Model,
  route: Router.Model
};
```
Where `user` is a Block we just wrote and `route` is a block for routing. When URL will be changed the `route` model will reflect to that changes. In some app block we want to execute some command when `route` in shared block changed, for example to load new items depending on the route params. How can we do that?
```javascript
export const Commands = {
  LoadSomething: Cmd.nope(),
  RouteSubscription: Cmd.subscription(({ model, shared }) => [
    Commands.LoadSomething
  ]);
};
export const View = () => ();
export const init = ({ shared, subscribe }) => ({
  subs: [ subscribe(shared.route, Commands.RouteSubscription) ],
  model: { ... }
})
```
Yeah, props passed to `init` is kind of blackhole. The Block will listen to changes in `route` model form shared Block. On any change of the model `RouteSubscription` command will be executed, which can return any other commands to execute. You can make more subscriptions in `init`, just return an array of subscriptions in `subs` field.

### Async commands
All commands we saw at this moment is just a synchronous commands for updating the model. For working with some async commands or any other business logic MangoJuice have Tasks. Task is a JS generator function that is executed using [redux-saga](https://github.com/yelouafi/redux-saga/). The main benefit of using redux-saga here is that you will have truly declarative, easy to test business logic.
```javascript
import { Task, Cmd } from 'mangojuice';

const _getRepos = () => Promise.resolve(...);

function* getGithubRepos() {
  yield Task.delay(200); // debounce a little bit
  const repos = yield Task.call(_getRepos);
  return repos;
}

const Commands = {
  SetGithubRepos: Cmd.update((props, repos) => ({ repos })),
  ShowError: Cmd.nope(),
  RetreiveGithubRepos: Cmd.execLatest(() => [
    Commands.SetGithubRepos,
    Commands.ShowError,
    getGithubRepos
  ]);
};
```
Let's go through the code. Firstly we defined generator function `getGithubRepos`, which debouncing the exact call to the API and then make a call, then it just returns the result. In `RetreiveGithubRepos` we are passing three things: success command, fail command and generator itself. `Cmd.execLatest` will call the generator and on success it will execute `SetGithubRepos` command with the result of generator, on some exception – `ShowError` with error as an argument. If `Cmd.execLatest` will be executed while another same command is executing, the first command (running saga) will be cancelled and new one will be started. There is also `Cmd.execEvery` to run the command every time.

### Ports – working with outside
For now we can produce a command only by some event from UI element or inside `init` function. It is also possible to work with other events, for example websocket, or browser history. You can do it through ports. Init function of the Block can return a field called `port` which should be a function that will be executed once instantly after a Block initialized but before View rendering.
```javascript
export const init = () => ({
  model: { ... },
  port: ({ exec, model, shared }) => {
    // Subscribe to any browser events
    // and call `exec` with command and arguments
    exec(Commands.HelloWorld, 'username');
  }
})
```
Props object passed to a `port` contains: block `model`, `shared` model and `exec` function. `exec` is actually a port to the block's environment. It provides a way to execute any command of the block.

## Conclusion
To conclude i'd like to highlight some most important benefits:
1. No callback hell in components (Blocks) tree.
2. Easy models nesting and async operations handling.
3. Fully controlled business logic execution
4. Declarative everywhere

## Complete example
In `./multipage` folder you can find a complete example with User model, Routing with nested routes, i18n, block decomposition... So, everything we just figured out and some more. To run the example:
```
npm i
cd ./multipage
npm i
npm run dev
```

## What's next
It is just a concept and i'm waiting for discussion about the interface of MangoJuice. The implementation of the interface is just a proof of concept and should not be considered as something usable. When the interface will be fixed this implementation will be reengineered to be maximum efficient, covered with tests and so on.
