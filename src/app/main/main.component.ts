import { Component, effect, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ArticleDTO, IArticleDTO } from '../objects/dataObjects';
import { ContentService } from '../shared/content.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

import { MarkdownModule } from 'ngx-markdown';	    

const ComponentName = 'MainComponent';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    MatCardModule, 
    MatDividerModule,
    MarkdownModule,							                      
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent {
  constructor() {
    effect(() => {

      this.pgNr = this.contentService.$noPostsPageNr();
      if (this.pgNr === 0 ) {
        if (this.contentService.$article().articleId > 0) {
          this.article = this.contentService.$article();
          this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.article.articleContent);
        }
      } else if (this.pgNr > 0) {
        this.pageContent = this.contentService.$pageContent();
        this.safeHtmlContent = this.sanitizer.bypassSecurityTrustHtml(this.pageContent);
      }
    });
  }

  private contentService = inject(ContentService);
  private sanitizer = inject(DomSanitizer);
  

  public article: ArticleDTO = new ArticleDTO();
  public pgNr: number = 0;
  public pageContent = '';
  public safeHtmlContent!: SafeHtml;

  
}
