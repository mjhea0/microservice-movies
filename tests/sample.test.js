import { Selector } from 'testcafe';

fixture('/login').page('http://localhost:3007');

test(`users should be able to log in and out`, async (t) => {

  // selectors
  const loginMessage = Selector('div').withText(
    'You successfully logged in! Welcome!')
  const logoutMessage = Selector('div').withText('You are now logged out')

  // login
  await t
    .navigateTo('http://localhost:3007')
    .typeText('input[name="username"]', 'michael')
    .typeText('input[name="password"]', 'herman')
    .click(Selector('button[type="submit"]'));

  // logout
  await t
    .expect(loginMessage.exists).ok()
    .click(Selector('a').withText('Logout'))
    .expect(logoutMessage.exists).ok()

});
