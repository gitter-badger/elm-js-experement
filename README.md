# MangoJuice
This is an experimental staff with one goal: bring the most stunning programming interface for developing awesome SPAs. I inspired for this after meet with Elm and many hours of work with React+Redux+Redux-Saga stack.


## The Architecture
The whole thing have only 4 entities: Model, Command, View and init function. That is everything you need to know to start building things. A set with Model, Commands, View and init function called Block. So, let's start from the Model.

### Model
Each Block have a Model. Model is an object with some type written with Flow type syntax.
```javascript
export type Model {
  name: string,
  authorized: bool
}
```
That's it. You should use it for Flowtype validation if you want. You can even omit describing the Model type, because it is just compile time thing. But it is strongly recommended to define the Model to make you app scalable and easy to maintain.

### Command
MangoJuice architecture based on The Elm Architecture (TEA). TEA based on well known Command Pattern architecture. So, it is better to say that MangoJuice is a Command Pattern implementation.
If you do not know what is the Command Pattern, here is [the long story](https://medium.com/front-end-developers/the-command-pattern-c51292e22ea7). But in short, the basic idea of the pattern is in commands (which is just an object that describes __what__ should be executed) that is executed by one central Executor. Any element on the page can produce a command and pass it to the Executor. The Executer decide when actually execute the command.

So, how commands is represented in MangoJuice?
```javascript
import { Cmd } from 'mangojuice'

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
Wow, so much new words! But do not panic! Let's meet with each of them. There is a home where all commands living called `Cmd` located in `mangojuice` module. This object have 4 type of commands:

1. For updating the model object – `Cmd.update(...)`
2. For invoking multiple commands in sequence – `Cmd.batch(...)`
3. ... 4...

...and some other types which we will meet a little bit later. As you can see, Command is just a declaration what should be done. But what you should have to know right now is about this weird arguments passed to the command function. The first argument is a props object which have current model object of the Block. All other arguments could be passed or not passed, it is up to the caller. The first argument passed by Executor.

In the example above when `TogetherCommand` called with one argument actually will be called `MyUpdateCmd` and `TogetherCommand` which sequentually update the model. Arguments passed to `TogetherCommand` is not propagated to child commands, so we are using special commands function `bindArgs` that is equivalent to `bind` in JS, but for Command.

### View
It is time to connect Commands with View. View in MangoJuice is a function that returns a layout based on a model object. Currently implemented binding only for React. But it could be any other View technology, which support views nesting and partial updates (view rerendering without touching subviews).

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
    <input onChange={exec(Commands.SetNameValue)} />
  </div>
);
```
We just defined our first almost functional Hello World Block. For each View passed a props object with model object and special `exec` function that creates another function that could be called by any view element to produce a command. In the exampale above on each type in input will be produced an action with one argument – input event. The command uses that event to set new name value. On each type, name in a `<span>` will be automatically changed.

### Init function
That is the final thing to define a complete Block. It is the place for difining couple of most important things: initial model object and initial command.
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
Congratulations, we just defined out first Block. Yeah, there is no View, but Block actually can live without View. And it is very important feature of the Block. We will see it in action a little bit later. But now let's go thorough the example.

Init function should return an object with specific type. We showed only two most important fields, it have a few others, but we will see it later. So, `command` field should contain a command that will be executed with newly created model object. In the example that command is just do nothing. `model` field should have all initial values of the model that can't be empty (in Flow all types is non-nullable, so we defined all required fields).

The function have some weird arguments too, but we will talk about it later.

### Block – all together.
As I said before, block is a set of Model, Commands, View and init. And moreover, Block module should have exactly this interface:
```javascript
export type Model = { ... };
export Commands = { ... };
export View = () => {};
export init = () => {};
```
If some module have that interface, then it is a Block. Otherwise it is not. It could be a part of a Block if exports only View, or only Commands, but it is not a Block.

So, it is time to run our Block. For this kind of thing MangoJuice have special Process module and a very special `start` function. Here it is in action:
```javascript
import { Process } from 'mangojuice';
import * as HelloBlock from './Hello';

Process.start({
  mount: docuemt.getElementById('container'),
  view: HelloBlock.View,
  app: HelloBlock.init
});
```
Here we go! This thing just bootstrap our Block: call `init` function, execute init command, call `View` function and mount it to provided mount point. It also listen to calls of `exec` from view to execute commands. Any change of model automatically rerun the view to update it reactively. That is all about the basics. Now let's do something more interesting.

### Nesting of Blocks
It is cool to have one Block, but what if we have an app that is big enough to have two Blocks? Or three Blocks? Let's say we want to write really big app – multiple counter app.
```javascript
// Counter.js – for single counter
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
  model: { value: initValues }
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
      nest(Commands.CounterMiddleware, Counter.init, 10)
    ]
  }))
};
export const View = ({ model, exec, nest }) => (
  <div>
    {model.counters.map(counter =>
      nest(counter, Commands.CounterMiddleware, Counter.View)
    )}
    <button onClick={exec(Commands.AddCounter)}>Add counter</button>
  </div>
);
export const init = ({ nest }) => ({
  model: { counters: [
    nest(Commands.CounterMiddleware, Counter.init)
  ] }
});
```
Hm... interesting. Now you see that props object passed to init, View and Command have one very useful function (especially for nesting) called `nest`. It helps with nesting some child view in `View` and some child model in `init` and `Command`. So, to nest on Block to another Block you should create a model for it. And that is what `nest` returning in `init` and `Command`. Then you will be able to use that model to nest some View for it. `nest` in View returns React element.

That is all kind of obvious. I guess you more interested in `Commands.CounterMiddleware`. This is another very important part of MangoJuice. When you are nesting model or view, you should provide to the `nest` function some middleware command, which will be invoked on every command happened in nested Block. Currently it is just a dummy middleware which not react on any command and just pass everything. Let's make something with it.
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
Now on each Increment of a Counter which have a value greater than 15 new Counter will be added to the App's model. Pretty useless but now you see how it works. I think you noticed `counterCmd` in the returned array. It is `Counter.Commands.Increment` command, and if you won't return it, it won't be executed. That simple.

In general, if you have some blocks chain `B1 <- B2 <- B3` and some command called in B3, before to be actually executed the command go through middleware in B1, then through B2 and only then it will be executed. All commands returned by middlewares will be executed after the command from B3.

That is all for nesting.

### Shared Block
Ok, but what if we need an access to some Model from any Block of the app. Let's say User model, to show or hide some controls for authorized users. In MangoJuice we have special Block that is called shared Block. It is a regular Block but just (generally) without a View. Let's create mentioned User shared Block.
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
Really simple Block. But how we supposed to use it everywhere? `Process.start` have special field in option called `shared`. You should pass init function of some Block to the `shared` field and you will be able to access the shared model everywhere. How? In props of `init`, `View` and any `Command` you will find `shared` field which is the model of the shared block.

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

Now take a look at `bindCommands` field in `init` function of the User block. Shared Blocks is a signletone Blocks, and this field bind each command in `Commands` with model object created by last call of `init` of the block. It makes possible to use that commands outside of the block. In the example above we are showing login and logout buttons which will actually change User model on click.

Any Block of the app depends on changes of shared model. So, if shared block (or any sub-block of shared block) changed, then the whole app will be re-rendered. So, move to shared block only rarely changed sub-blocks.

### Subscriptions to shared Blocks
Sometimes it is useful in some app block to know that some shared sub-block changed to executed some commands by this event. Assume that we have shared block with this model:
```javascript
export type Model = {
  user: User.Model,
  route: Router.Model
};
```
Where `user` is a Block we just wrote and `route` is a block for routing. When URL changed `route` model changed too. In some app block we want to execute some command when `route` in shared block changed. How we can do that?
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
Yeah, props passed to `init` is kind of blackhole. This Block will listen to changes in `route` model form shared. On any change of the model `RouteSubscription` command will be executed, which can return any other commands to execute, like `Cmd.middleware` or `Cmd.batch`. You can make more subscriptions in `init`, just return an array of subscriptions in `subs` field.

### Async commands
All commands we saw at this moment is just a synchronous commands for updating the model. For working with some async commands or any  other business logic MangoJuice have Tasks. Task is a JS generator function that is executed using [redux-saga](https://github.com/yelouafi/redux-saga/). The main benefit of using redux-saga here is that you will have truly declarative, easy to test business logic. Let me show you some example.
```javascript
import { Task, Cmd } from 'mangojuice';

function* getGithubRepos() {
  yield Task.delay(200); // debounce a little bit
  const repos = yield Task.call(_getRepos);
  return repos;
}

const Commands = {
  SetGithubRepos: Cmd.update((props, repos) => ({ repos })),
  ShowRetreiveError: Cmd.nope(),
  RetreiveGithubRepos: Cmd.execLatest(() => [
    Commands.SetGithubRepos,
    Commands.ShowRetreiveError,
    getGithubRepos
  ]);
};
```
Let's go through the code. Firstly we defined generator function `getGithubRepos`, which debouncing the exact call to the API and make a call, then it just returns the result. In `RetreiveGithubRepos` we are returning three things: success command, fail command and generator itself. `Cmd.execLatest` will call the generator and on success it will execute `SetGithubRepos` command with the result of generator, on some exception – `ShowRetreiveError` with error as an argument. `Cmd.execLatest` called that way because if this command will be executed while another is executing, the first generator will be cancelled and new one started. There is also `Cmd.execEvery` to run generator on every execution of the command.

### Ports – working with outside
For now we can produce a command only by some event from UI element or inside `init` function. It is also possible to work with other events, for example websocket, or browser history. You can do it through ports. Init function of the Block can return a field called `port` which should be a function that will be executed once instantly after Block initialization but before View rendering.
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
Props object passed to port with some mostly useful things: block `model`, `shared` model and `exec` function. `exec` is actually a port to the block's environment. It provides a way to execute any command of the block.

## Complete example
In `./multipage` folder you will find a complete example with User model, Routing with nested routes, i18n block usage, block decomposition example... So, everything we just figured out and some more. To run the example:
```
npm i
cd ./multipage
npm i
npm run dev
```

## What's next
It is just a concept and i'm waiting for discussion about the interface of MangoJuice. The implementation of the interface is just a proof of concept and should not be considered as something usable. When the interface will be fixed this implementation will be reengineered to be maximum efficient, covered with tests and so on.
