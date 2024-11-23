import { inject, Injectable, signal } from '@angular/core';
import { DataService } from './data.service';
import { IArticle, ICategory, Pages } from './dbObjects/blogObjects';
import { Location } from '@angular/common';
import { environment } from '../environments/environment';

const ComponentName = 'ContentService';

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  constructor() {
    const initialPath: string = this.location.path().trim().slice(1);
    // console.log('>=== uuu >> ' + ComponentName + ' Location Init Path ' + initialPath);
    const pgNr = Pages.find((p) => p.PageSlug === initialPath)?.PageId;
    // console.log('>=== uuu >> ' + ComponentName + ' Page Nr found: ' + pgNr);

    if (initialPath.length === 0) {
      this.signalPageContent(1);
    } else if (pgNr && pgNr > 0 && pgNr < 99) {
      this.signalPageContent(pgNr);
    } else if (initialPath.startsWith(this.postsPrefix)) {
      // const slug = initialPath.startsWith(prefix) ? initialPath.replace(prefix, '') : initialPath;
      const slug = initialPath.slice(this.postsPrefix.length);
      this.signalArticle(slug);
    } else {
      // Not Found
      //this.signalPageContent(99);
      console.log('>=== uuu >> ' + ComponentName + ' Requested URL: ' + this.location.path());
    }

    if (this.$categories.length === 0) {
      this.signalCategories();
    }
  }

  componentName = this.constructor.name.replace('_', '');

  postsPrefix: string = environment.postsPrefix;
  private dataService = inject(DataService);
  private location = inject(Location);

  public $noPostsPageNr = signal<number>(0);
  public $pageContent = signal<string>('');

  public $categories = signal<ICategory[]>([]);
  public $category = signal<ICategory>({ categoryId: 0, categoryTitle: '' });
  public $article = signal<IArticle>({
    articleId: -1,
    categoryId: -1,
    articleTitle: '',
    articleSubTitle: '',
    articleContent: '',
    articleSlug: '',
  });
  public $categoryArticles = signal<IArticle[]>([]);

  public signalCategories(): void {
    this.dataService.getCategories().subscribe((categories: ICategory[]) => {
      this.$categories.set(categories);
      // if (this.$category().categoryId === 0) this.signalCategory(1);
    });
  }

  public signalCategory(categoryId: number): void {
    this.dataService
      .getCategory(categoryId)
      .subscribe((category: ICategory) => {
        if (category) {
          this.$category.set(category);
          // console.log('>=== ccc >> ' + ComponentName + ' - ' + 'signalCategory()' + ' *  Category: * ' +  this.$category().categoryId + ' **-** ' );
          this.signalCategoryArticles(this.$category().categoryId);
        } else {
          this.$category.set({
            categoryId: 0,
            categoryTitle: 'Category Not Found!',
          });
        }
      });
  }

  public signalCategoryArticles(categoryId: number): void {
    this.dataService
      .getCategoryArticles(categoryId)
      .subscribe((categoryarticles: IArticle[]) => {
        this.$categoryArticles.set(categoryarticles);
        // console.log('>=== --- >> ' + ComponentName + ' - ' + 'signalCategoryArticles()' + ' * Before ifs * ' +  this.$article().articleId + ' **-** ' + this.$article().articleSlug);
        if (this.$article().categoryId != categoryId) {
            this.signalArticle(this.$categoryArticles()[0].articleId);
        } else  {
          this.location.replaceState(
            this.postsPrefix + this.$article().articleSlug
          );
        }
        // console.log('>=== --- >> ' + ComponentName + ' - ' + 'signalCategoryArticles()' + '* After ifs * ' +  this.$article().articleId + ' **-** ' + this.$article().articleSlug);
      });
  }

  public signalArticle(requestedArticle: number | string): void {
    // console.log('>=== aaa >> ' + ComponentName + ' - ' + 'signalArticle()' + ' - we are going to fetch the article with id: ' +  requestedId);
    this.dataService
      .getArticle(requestedArticle)
      .subscribe((article: IArticle) => {
        // console.log(
        //   '>=== aaa >> ' +
        //     ComponentName +
        //     ' - ' +
        //     'signalArticle() ' +
        //     ' Article fetched: ' +
        //     article.articleId +
        //     ' * article category ID * ' +
        //     article.categoryId +
        //     ' * before Categoy category ID * ' +
        //     article.articleSlug 
        // );
        if (article && article.articleId > 0) {
          this.$article.set(article);
          if (typeof requestedArticle === 'number') {
            // !!!! Update address bar with article's slug !!!!
            this.location.replaceState(
              this.postsPrefix + this.$article().articleSlug
            );
          }
          this.signalCategory(this.$article().categoryId);
          // console.log('>=== aaa >> ' + ComponentName + ' - ' + 'signalArticle() 2' + ' article fetched: ' + this.$article().articleId  + ' * article category ID * ' +  this.$article().categoryId + ' * Categoy category ID * ' + this.$category().categoryId);
        } else {
          // this.$article.set({
          //   articleId: -1,
          //   categoryId: -1,
          //   articleTitle: 'Not Found!',
          //   articleSubTitle: 'Article Not Found!',
          //   articleContent: 'Not Found!',
          //   articleSlug: 'Not Found!',
          // });
          // Not Found
          this.signalPageContent(99);
          // console.log('>=== aaa >> ' + ComponentName + ' - ' + 'signalArticle()' + ' - ' +  JSON.stringify(this.$article()));
        }
      });
  }

  public signalPageContent(pageId: number): void {
    if (pageId === 0) {
      this.$noPostsPageNr.set(0);
      return;
    }
    const page = Pages.find((p) => p.PageId === pageId);

    if (page) {
      // console.log(
      //   '>===>> ' +
      //     ComponentName +
      //     ' - ' +
      //     'Page Id: ' +
      //     page.PageId +
      //     ' Slug: ' +
      //     page.PageSlug
      // );
      this.dataService
        .getPage(page.PageTitle)
        .subscribe((htmlContent: string) => {
          if (htmlContent) {
            this.$pageContent.set(htmlContent);
            this.$noPostsPageNr.set(pageId);
            this.location.replaceState(page.PageSlug);
          } else {
            this.$pageContent.set('HTML Page Not Found!');
          }
        });
    } else {
      this.$pageContent.set('Unknown HTML Page!');
    }
    // console.log('>===>> ' + ComponentName + ' - ' + 'Page Id: ' + this.$noPostsPageNr() + ' Content: ' + this.$pageContent());
  }
}


