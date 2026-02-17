import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  BarChart3,
  Newspaper,
  Map,
  LogIn,
  LayoutDashboard,
  ClipboardCheck,
  PieChart,
  FileText,
  Home,
} from 'lucide-react';

const publicItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Article Explorer', url: '/explorer', icon: Newspaper },
  { title: 'Ideological Map', url: '/map', icon: Map },
];

const reviewerItems = [
  { title: 'Reviewer Login', url: '/login', icon: LogIn },
  { title: 'Reviewer Dashboard', url: '/reviewer', icon: LayoutDashboard },
  { title: 'Review Queue', url: '/review', icon: ClipboardCheck },
  { title: 'Analytics', url: '/analytics', icon: PieChart },
];

const infoItems = [
  { title: 'Transparency', url: '/transparency', icon: FileText },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <div className="px-4 py-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-sidebar-primary" />
            <div>
              <h1 className="text-sm font-bold text-sidebar-primary">Bias Observatory</h1>
              <p className="text-[10px] text-sidebar-muted">News Analysis Platform</p>
            </div>
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted">Public</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted">Reviewer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reviewerItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-muted">Info</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {infoItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="text-sidebar-foreground hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
