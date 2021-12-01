import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
<% if (entity) { %>
import { <%=classify(entity)%> } from '../entities/<%=dasherize(entity)%>';
import { <%=classify(entity)%>DataService } from '../infrastructure/<%=dasherize(entity)%>.data.service';
<% } %>

@Injectable({ providedIn: 'root' })
export class <%=classify(name)%>Facade {
<% if (entity) { %>
    private <%=camelize(entity)%>ListSubject = new BehaviorSubject<<%=classify(entity)%>[]>([]); 
    <%=camelize(entity)%>List$ = this.<%=camelize(entity)%>ListSubject.asObservable();

    constructor(private <%=camelize(entity)%>DataService: <%=classify(entity)%>DataService) {
    }

    load(): void {
        this.<%=camelize(entity)%>DataService.load().subscribe(
            <%=camelize(entity)%>List => {
                this.<%=camelize(entity)%>ListSubject.next(<%=camelize(entity)%>List)
            },
            err => {
                console.error('err', err);
            }
        );
    }
<% } %>
}
