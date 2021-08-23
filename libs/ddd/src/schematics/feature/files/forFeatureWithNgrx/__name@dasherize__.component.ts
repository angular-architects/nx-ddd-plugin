import { Component, OnInit} from '@angular/core';
import { <%=classify(name)%>Facade, load<%=classify(entity)%> } from '<%=workspaceName%>/<%=dasherize(domain)%><%- domainDirectory ? '/' + domainDirectory : '' %>/domain';

@Component({
  selector: '<%=dasherize(domain)%>-<%=dasherize(name)%>',
  templateUrl: './<%=dasherize(name)%>.component.html',
  styleUrls: ['./<%=dasherize(name)%>.component.scss']
})
export class <%=classify(name)%>Component implements OnInit {
    
<% if (entity) { %>    
    <%=camelize(entity)%>List$ = this.<%=camelize(name)%>Facade.<%=camelize(entity)%>List$;
<% } %>

    constructor(private <%=camelize(name)%>Facade: <%=classify(name)%>Facade) {
    }

<% if (entity) { %>    
    ngOnInit() {
        this.load();
    }

    load(): void {
        this.<%=camelize(name)%>Facade.dispatch(load<%=classify(entity)%>());
    }
<% } else { %>
    ngOnInit() {
    }
<% } %>
}

