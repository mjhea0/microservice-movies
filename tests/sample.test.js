import { Selector } from 'testcafe';
import { generateUser } from './_helpers';

fixture('/login').page('http://localhost:3007');

test(`users should be able to register, log in, and log out`, async (t) => {

  // selectors
  const loginMessage = Selector('div').withText(
    'You successfully logged in! Welcome!')
  const logoutMessage = Selector('div').withText('You are now logged out')

  // register
  await t
    .navigateTo('http://localhost:3007/register')
    .typeText('input[name="username"]', 'michael')
    .typeText('input[name="password"]', 'herman')
    .click(Selector('button[type="submit"]'));

  // login
  await t
    .navigateTo('http://localhost:3007/login')
    .typeText('input[name="username"]', 'michael')
    .typeText('input[name="password"]', 'herman')
    .click(Selector('button[type="submit"]'));

  // logout
  await t
    .expect(loginMessage.exists).ok()
    .click(Selector('a').withText('Logout'))
    .expect(logoutMessage.exists).ok()

});
