// testCafe test
import { Selector } from 'testcafe';

fixture `Getting Started`
    .page `file:///Users/Martin/Desktop/password-reuse-manager/background/background.html`;


test('Open Category Detail', async t => {
    await t
        .click('.panel-card:first-of-type')
        .expect(Selector('#entryContainer > .row-header').innerText).eql('.panel-card:first-of-type > .text-middle').innerText;
});