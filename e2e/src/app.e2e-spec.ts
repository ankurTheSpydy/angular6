import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display message saying Ristorante Con Fusion', () => {
    page.navigateTo('/');
    expect(page.getParagraphText('app-root h1')).toEqual('Ristorante Con Fusion');
  });
  it('should navigate to about us page by clicking on the link', () => {
    page.navigateTo('/');
    page.getAllElements('a').get(1).click();

    expect(page.getParagraphText('h3')).toBe('About Us');
  });
  it('should enter a new comment for the first dish', () => {
    page.navigateTo('/dishdetail/0');
    page.getElement('input[type=text]').sendKeys('Test Author');
    page.getElement('textarea').sendKeys('Test Comment');
    page.getElement('button[type=submit]').click();
  });
});
