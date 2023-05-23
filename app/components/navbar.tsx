import { NavLink } from "@remix-run/react";
import clsx from "clsx";

const LINKS = [
  {
    name: "Home",
    to: "/",
  },
  {
    name: "About",
    to: "/about",
  },
  {
    name: "Blog",
    to: "/blog",
  },
];

export const NavBar = () => {
  return (
    <nav>
      <ul>
        {LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive, isPending }) =>
                clsx({ "text-red-600": isActive, "text-blue-600": isPending })
              }
            >
              {link.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
