

import { signOut } from "aws-amplify/auth";

import "@/assets/css/themes/echo.css";
import { Transition } from "react-transition-group";
// import Breadcrumb from "@/components/Base/Breadcrumb";
import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { selectSideMenu } from "@/stores/sideMenuSlice";
import {
  selectCompactMenu,
  setCompactMenu as setCompactMenuStore,
} from "@/stores/compactMenuSlice";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { FormattedMenu, linkTo, nestedMenu, enter, leave } from "./side-menu";
import Lucide from "@/components/Base/Lucide";
import clsx from "clsx";
import { Menu } from "@/components/Base/Headless";

import SwitchAccount from "@/components/SwitchAccount";
import NotificationsPanel from "@/components/NotificationsPanel";
import ActivitiesPanel from "@/components/ActivitiesPanel";


function Main() {
  const dispatch = useAppDispatch();
  const compactMenu = useAppSelector(selectCompactMenu);
  const setCompactMenu = (val: boolean) => {
    localStorage.setItem("compactMenu", val.toString());
    dispatch(setCompactMenuStore(val));
  };
  const [quickSearch, setQuickSearch] = useState(false);
  const [switchAccount, setSwitchAccount] = useState(false);
  const [notificationsPanel, setNotificationsPanel] = useState(false);
  const [activitiesPanel, setActivitiesPanel] = useState(false);
  const [compactMenuOnHover, setCompactMenuOnHover] = useState(false);
  const [activeMobileMenu, setActiveMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [formattedMenu, setFormattedMenu] = useState<
    Array<FormattedMenu | string>
  >([]);
  const sideMenuStore = useAppSelector(selectSideMenu);
  const sideMenu = () => nestedMenu(sideMenuStore, location);

  const [topBarActive, setTopBarActive] = useState(false);

  const toggleCompactMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setCompactMenu(!compactMenu);
  };

  const compactLayout = () => {
    if (window.innerWidth <= 1600) {
      setCompactMenu(true);
    }
  };

  const requestFullscreen = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen();
    }
  };


  
  useEffect(() => {
    setFormattedMenu(sideMenu());
    compactLayout();

    window.onresize = () => {
      compactLayout();
    };
  }, [sideMenuStore, location]);

  window.onscroll = () => {
    // Topbar
    if (document.body.scrollTop > 0 || document.documentElement.scrollTop > 0) {
      setTopBarActive(true);
    } else {
      setTopBarActive(false);
    }
  };

  return (
    <div
      className={clsx([
        "echo group bg-gradient-to-b from-slate-200/70 to-slate-50 background relative min-h-screen",
        "before:content-[''] before:h-[370px] before:w-screen before:bg-gradient-to-t before:from-theme-1/80 before:to-theme-2 [&.background--hidden]:before:opacity-0 before:transition-[opacity,height] before:ease-in-out before:duration-300 before:top-0 before:fixed",
        "after:content-[''] after:h-[370px] after:w-screen [&.background--hidden]:after:opacity-0 after:transition-[opacity,height] after:ease-in-out after:duration-300 after:top-0 after:fixed after:bg-texture-white after:bg-contain after:bg-fixed after:bg-[center_-13rem] after:bg-no-repeat",
        topBarActive && "background--hidden",
      ])}
    >
      <div
        className={clsx([
          "xl:ml-0 shadow-xl transition-[margin,padding] duration-300 xl:shadow-none fixed top-0 left-0 z-50 side-menu group inset-y-0 xl:py-3.5 xl:pl-3.5",
          "after:content-[''] after:fixed after:inset-0 after:bg-black/80 after:xl:hidden",
          { "side-menu--collapsed": compactMenu },
          { "side-menu--on-hover": compactMenuOnHover },
          { "ml-0 after:block": activeMobileMenu },
          { "-ml-[275px] after:hidden": !activeMobileMenu },
        ])}
      >
        <div
          className={clsx([
            "fixed ml-[275px] w-10 h-10 items-center justify-center xl:hidden z-50",
            { flex: activeMobileMenu },
            { hidden: !activeMobileMenu },
          ])}
        >
          <a
            href=""
            onClick={(event) => {
              event.preventDefault();
              setActiveMobileMenu(false);
            }}
            className="mt-5 ml-5"
          >
            <Lucide icon="X" className="w-8 h-8 text-white" />
          </a>
        </div>
        <div
          className={clsx([
            "h-full box bg-white/[0.95] rounded-none xl:rounded-xl z-20 relative w-[275px] duration-300 transition-[width] group-[.side-menu--collapsed]:xl:w-[91px] group-[.side-menu--collapsed.side-menu--on-hover]:xl:shadow-[6px_0_12px_-4px_#0000000f] group-[.side-menu--collapsed.side-menu--on-hover]:xl:w-[275px] overflow-hidden flex flex-col",
          ])}
          onMouseOver={(event) => {
            event.preventDefault();
            setCompactMenuOnHover(true);
          }}
          onMouseLeave={(event) => {
            event.preventDefault();
            setCompactMenuOnHover(false);
          }}
        >
          <div
            className={clsx([
              "flex-none hidden xl:flex items-center z-10 px-5 h-[65px] w-[275px] overflow-hidden relative duration-300 group-[.side-menu--collapsed]:xl:w-[91px] group-[.side-menu--collapsed.side-menu--on-hover]:xl:w-[275px]",
            ])}
          >
            <a
              href=""
              className="flex items-center transition-[margin] duration-300 group-[.side-menu--collapsed] group-[.side-menu--collapsed.side-menu--on-hover]"
            >
              {/* <div className="flex items-center justify-center w-[34px] rounded-lg h-[34px] bg-gradient-to-b from-theme-1 to-theme-2/80 transition-transform ease-in-out group-[.side-menu--collapsed.side-menu--on-hover]:xl:-rotate-180">
                <div className="w-[16px] h-[16px] relative -rotate-45 [&_div]:bg-white">
                  <div className="absolute w-[21%] left-0 inset-y-0 my-auto rounded-full opacity-50 h-[75%]"></div>
                  <div className="absolute w-[21%] inset-0 m-auto h-[120%] rounded-full"></div>
                  <div className="absolute w-[21%] right-0 inset-y-0 my-auto rounded-full opacity-50 h-[75%]"></div>
                </div>
              </div>
              */}
              <div className="flex items-center justify-center w-[48px] rounded-lg  transition-transform ease-in-out group-[.side-menu--collapsed.side-menu--on-hover]:xl:-rotate-180">
                <svg width="767" height="512" viewBox="0 0 767 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M444.482 512C421.6 512 402.984 493.384 402.984 470.502V338.746C402.984 332.671 407.909 327.746 413.984 327.746C420.059 327.746 424.984 332.671 424.984 338.746V470.502C424.984 481.253 433.731 490 444.482 490C455.233 490 463.98 481.253 463.98 470.502V460.336C463.98 454.261 468.905 449.336 474.98 449.336C481.055 449.336 485.98 454.261 485.98 460.336V470.502C485.98 493.384 467.364 512 444.482 512Z" fill="#AE5EAB"/>
                  <path d="M566.473 471.336C543.591 471.336 524.975 452.72 524.975 429.839V345.29C524.975 339.215 529.9 334.29 535.975 334.29C542.05 334.29 546.975 339.215 546.975 345.29V429.838C546.975 440.589 555.722 449.335 566.473 449.335C577.224 449.335 585.971 440.588 585.971 429.838V419.672C585.971 413.597 590.896 408.672 596.971 408.672C603.046 408.672 607.971 413.597 607.971 419.672V429.838C607.971 452.72 589.355 471.336 566.473 471.336Z" fill="#AE5EAB"/>
                  <path d="M322.49 512C299.608 512 280.992 493.384 280.992 470.502V460.336C280.992 454.261 285.917 449.336 291.992 449.336C298.067 449.336 302.992 454.261 302.992 460.336V470.502C302.992 481.253 311.739 490 322.49 490C333.241 490 341.988 481.253 341.988 470.502V338.847C341.988 332.772 346.913 327.847 352.988 327.847C359.063 327.847 363.988 332.772 363.988 338.847V470.502C363.988 493.384 345.372 512 322.49 512Z" fill="#AE5EAB"/>
                  <path d="M200.498 471.336C177.616 471.336 159 452.72 159 429.839V419.673C159 413.598 163.925 408.673 170 408.673C176.075 408.673 181 413.598 181 419.673V429.839C181 440.59 189.747 449.336 200.498 449.336C211.249 449.336 219.996 440.589 219.996 429.839V345.295C219.996 339.22 224.921 334.295 230.996 334.295C237.071 334.295 241.996 339.22 241.996 345.295V429.839C241.996 452.72 223.38 471.336 200.498 471.336Z" fill="#AE5EAB"/>
                  <path d="M597.806 184.457C597.806 144.714 574.234 99.05 534.749 62.305C491.576 22.127 437.856 0 383.487 0C329.118 0 275.398 22.127 232.225 62.305C192.74 99.05 169.168 144.714 169.168 184.457C169.168 219.106 187.094 245.108 222.473 261.926L197.837 323.514C194.781 331.154 195.711 339.782 200.324 346.596C204.937 353.41 212.603 357.477 220.831 357.477C238.06 357.477 247.208 350.622 254.558 345.113C260.731 340.487 265.19 337.145 275.091 337.145C284.991 337.145 289.451 340.487 295.624 345.113C302.974 350.621 312.122 357.477 329.351 357.477C346.573 357.477 355.715 350.62 363.061 345.111C369.228 340.486 373.684 337.145 383.573 337.145C393.448 337.145 397.899 340.485 404.058 345.109C411.4 350.619 420.537 357.477 437.748 357.477C454.967 357.477 464.107 350.62 471.452 345.11C477.615 340.486 482.069 337.145 491.952 337.145C501.832 337.145 506.284 340.486 512.445 345.109C519.789 350.619 528.927 357.477 546.142 357.477C554.37 357.477 562.037 353.41 566.649 346.597C571.262 339.783 572.192 331.155 569.136 323.514L544.501 261.926C579.88 245.108 597.806 219.106 597.806 184.457ZM548.432 334.262C548.057 334.816 547.355 335.477 546.142 335.477C536.263 335.477 531.811 332.136 525.65 327.513C518.306 322.003 509.168 315.145 491.952 315.145C474.734 315.145 465.594 322.002 458.25 327.512C452.086 332.136 447.632 335.477 437.748 335.477C427.874 335.477 423.424 332.137 417.265 327.514C409.923 322.004 400.787 315.145 383.573 315.145C366.351 315.145 357.208 322.002 349.862 327.511C343.695 332.136 339.24 335.477 329.351 335.477C319.45 335.477 314.99 332.135 308.817 327.509C301.467 322.001 292.32 315.145 275.09 315.145C257.861 315.145 248.714 322.001 241.364 327.509C235.191 332.135 230.731 335.477 220.831 335.477C219.619 335.477 218.916 334.816 218.541 334.262C218.166 333.707 217.812 332.81 218.263 331.684L242.933 270.01C276.565 280.973 322.666 286.315 383.487 286.315C444.308 286.315 490.409 280.974 524.041 270.01L548.71 331.683C549.161 332.811 548.807 333.708 548.432 334.262ZM527.685 245.609C483.228 263.79 430.844 264.315 383.487 264.315C347.874 264.315 311.849 264.052 276.849 256.696C247.547 250.538 210.288 239.108 196.477 209.658C192.786 201.787 191.169 193.121 191.169 184.456C191.168 120.552 273.752 22 383.487 22C493.221 22 575.806 120.552 575.806 184.456C575.807 216.016 554.787 234.525 527.685 245.609Z" fill="#AE5EAB"/>
                  <path d="M386.004 172.964C379.929 172.964 375.004 168.039 375.004 161.964V121.3C375.004 115.225 379.929 110.3 386.004 110.3C392.079 110.3 397.004 115.225 397.004 121.3V161.964C397.004 168.039 392.079 172.964 386.004 172.964Z" fill="#AE5EAB"/>
                  <path d="M436.824 203.463C434.527 203.463 432.212 202.747 430.233 201.262C425.373 197.617 424.387 190.722 428.033 185.862L458.531 145.198C462.176 140.338 469.07 139.352 473.93 142.998C478.79 146.643 479.776 153.537 476.13 158.398L445.632 199.062C443.472 201.944 440.169 203.463 436.824 203.463Z" fill="#AE5EAB"/>
                  <path d="M335.181 203.463C331.836 203.463 328.534 201.944 326.372 199.063L295.874 158.399C292.229 153.539 293.214 146.644 298.074 142.999C302.935 139.353 309.829 140.339 313.473 145.199L343.971 185.863C347.616 190.723 346.631 197.618 341.771 201.263C339.793 202.746 337.476 203.463 335.181 203.463Z" fill="#AE5EAB"/>
                  <circle cx="648.5" cy="127.5" r="22.5" stroke="#AE5EAB" stroke-width="10"/>
                  <circle cx="739.5" cy="62.5" r="22.5" stroke="#AE5EAB" stroke-width="10"/>
                  <circle cx="27.5" cy="27.5" r="22.5" transform="matrix(-1 0 0 1 149 100)" stroke="#AE5EAB" stroke-width="10"/>
                  <circle cx="27.5" cy="27.5" r="22.5" transform="matrix(-1 0 0 1 57 35)" stroke="#AE5EAB" stroke-width="10"/>
                  <path d="M97 372.5C97 360.24 107.351 350 120.5 350C133.649 350 144 360.24 144 372.5C144 384.76 133.649 395 120.5 395C107.351 395 97 384.76 97 372.5Z" stroke="#AE5EAB" stroke-width="10"/>
                  <path d="M5 434.5C5 422.24 15.3515 412 28.5 412C41.6485 412 52 422.24 52 434.5C52 446.76 41.6485 457 28.5 457C15.3515 457 5 446.76 5 434.5Z" stroke="#AE5EAB" stroke-width="10"/>
                  <circle cx="27.5" cy="27.5" r="22.5" transform="matrix(1 0 0 -1 621 400)" stroke="#AE5EAB" stroke-width="10"/>
                  <circle cx="27.5" cy="27.5" r="22.5" transform="matrix(1 0 0 -1 708 462)" stroke="#AE5EAB" stroke-width="10"/>
                </svg>
              </div>
             
              <div className="ml-3.5 group-[.side-menu--collapsed.side-menu--on-hover]:xl:opacity-100 group-[.side-menu--collapsed]:xl:opacity-0 transition-opacity font-medium">
                Miniswimmer
              </div> 
              

            </a>
            <a
              href=""
              onClick={toggleCompactMenu}
              className="hidden group-[.side-menu--collapsed.side-menu--on-hover]:xl:opacity-100 group-[.side-menu--collapsed]:xl:rotate-180 group-[.side-menu--collapsed]:xl:opacity-0 transition-[opacity,transform] 3xl:flex items-center justify-center w-[20px] h-[20px] ml-auto border rounded-full border-slate-600/40 hover:bg-slate-600/5"
            >
              <Lucide icon="ArrowLeft" className="w-3.5 h-3.5 stroke-[1.3]" />
            </a>
          </div>
          <div
            className={clsx([
              "w-full h-full z-20 px-5 overflow-y-auto overflow-x-hidden pb-3 [-webkit-mask-image:-webkit-linear-gradient(top,rgba(0,0,0,0),black_30px)] [&:-webkit-scrollbar]:w-0 [&:-webkit-scrollbar]:bg-transparent",
            ])}
          >
            <ul className="scrollable">
              {/* BEGIN: First Child */}
              {formattedMenu.map((menu, menuKey) =>
                typeof menu == "string" ? (
                  <li className="side-menu__divider" key={menuKey}>
                    {menu}
                  </li>
                ) : (
                  <li key={menuKey}>
                    <a
                      href=""
                      className={clsx([
                        "side-menu__link",
                        { "side-menu__link--active": menu.active },
                        {
                          "side-menu__link--active-dropdown":
                            menu.activeDropdown,
                        },
                      ])}
                      onClick={(event: React.MouseEvent) => {
                        event.preventDefault();
                        linkTo(menu, navigate);
                        setFormattedMenu([...formattedMenu]);
                      }}
                    >
                      <Lucide
                        icon={menu.icon}
                        className="side-menu__link__icon"
                      />
                      <div className="side-menu__link__title">{menu.title}</div>
                      {menu.badge && (
                        <div className="side-menu__link__badge">
                          {menu.badge}
                        </div>
                      )}
                      {menu.subMenu && (
                        <Lucide
                          icon="ChevronDown"
                          className="side-menu__link__chevron"
                        />
                      )}
                    </a>
                    {/* BEGIN: Second Child */}
                    {menu.subMenu && (
                      <Transition
                        in={menu.activeDropdown}
                        onEnter={enter}
                        onExit={leave}
                        timeout={300}
                      >
                        <ul
                          className={clsx([
                            "",
                            { block: menu.activeDropdown },
                            { hidden: !menu.activeDropdown },
                          ])}
                        >
                          {menu.subMenu.map((subMenu, subMenuKey) => (
                            <li key={subMenuKey}>
                              <a
                                href=""
                                className={clsx([
                                  "side-menu__link",
                                  { "side-menu__link--active": subMenu.active },
                                  {
                                    "side-menu__link--active-dropdown":
                                      subMenu.activeDropdown,
                                  },
                                ])}
                                onClick={(event: React.MouseEvent) => {
                                  event.preventDefault();
                                  linkTo(subMenu, navigate);
                                  setFormattedMenu([...formattedMenu]);
                                }}
                              >
                                <Lucide
                                  icon={subMenu.icon}
                                  className="side-menu__link__icon"
                                />
                                <div className="side-menu__link__title">
                                  {subMenu.title}
                                </div>
                                {subMenu.badge && (
                                  <div className="side-menu__link__badge">
                                    {subMenu.badge}
                                  </div>
                                )}
                                {subMenu.subMenu && (
                                  <Lucide
                                    icon="ChevronDown"
                                    className="side-menu__link__chevron"
                                  />
                                )}
                              </a>
                              {/* BEGIN: Third Child */}
                              {subMenu.subMenu && (
                                <Transition
                                  in={subMenu.activeDropdown}
                                  onEnter={enter}
                                  onExit={leave}
                                  timeout={300}
                                >
                                  <ul
                                    className={clsx([
                                      "",
                                      {
                                        block: subMenu.activeDropdown,
                                      },
                                      { hidden: !subMenu.activeDropdown },
                                    ])}
                                  >
                                    {subMenu.subMenu.map(
                                      (lastSubMenu, lastSubMenuKey) => (
                                        <li key={lastSubMenuKey}>
                                          <a
                                            href=""
                                            className={clsx([
                                              "side-menu__link",
                                              {
                                                "side-menu__link--active":
                                                  lastSubMenu.active,
                                              },
                                              {
                                                "side-menu__link--active-dropdown":
                                                  lastSubMenu.activeDropdown,
                                              },
                                            ])}
                                            onClick={(
                                              event: React.MouseEvent
                                            ) => {
                                              event.preventDefault();
                                              linkTo(lastSubMenu, navigate);
                                              setFormattedMenu([
                                                ...formattedMenu,
                                              ]);
                                            }}
                                          >
                                            <Lucide
                                              icon={lastSubMenu.icon}
                                              className="side-menu__link__icon"
                                            />
                                            <div className="side-menu__link__title">
                                              {lastSubMenu.title}
                                            </div>
                                            {lastSubMenu.badge && (
                                              <div className="side-menu__link__badge">
                                                {lastSubMenu.badge}
                                              </div>
                                            )}
                                          </a>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </Transition>
                              )}
                              {/* END: Third Child */}
                            </li>
                          ))}
                        </ul>
                      </Transition>
                    )}
                    {/* END: Second Child */}
                  </li>
                )
              )}
              {/* END: First Child */}
            </ul>
          </div>
        </div>
        <div className="fixed h-[65px] transition-[margin] duration-100 xl:ml-[275px] group-[.side-menu--collapsed]:xl:ml-[90px] mt-3.5 inset-x-0 top-0">
          <div
            className={clsx([
              "top-bar absolute left-0 xl:left-3.5 right-0 h-full mx-5 group",
              "before:content-[''] before:absolute before:top-0 before:inset-x-0 before:-mt-[15px] before:h-[20px] before:backdrop-blur",
              topBarActive && "top-bar--active",
            ])}
          >
            <div
              className="
                container flex items-center w-full h-full transition-[padding,background-color,border-color] ease-in-out duration-300 box bg-transparent border-transparent shadow-none 
                group-[.top-bar--active]:box group-[.top-bar--active]:px-5
                group-[.top-bar--active]:bg-transparent group-[.top-bar--active]:border-transparent group-[.top-bar--active]:bg-gradient-to-r group-[.top-bar--active]:from-theme-1 group-[.top-bar--active]:to-theme-2
              "
            >
              <div className="flex items-center gap-1 xl:hidden">
                <a
                  href=""
                  onClick={(event) => {
                    event.preventDefault();
                    setActiveMobileMenu(true);
                  }}
                  className="p-2 text-white rounded-full hover:bg-white/5"
                >
                  <Lucide icon="AlignJustify" className="w-[18px] h-[18px]" />
                </a>
                <a
                  href=""
                  className="p-2 text-white rounded-full hover:bg-white/5"
                  onClick={(e) => {
                    e.preventDefault();
                    setQuickSearch(true);
                  }}
                >
                  <Lucide icon="Search" className="w-[18px] h-[18px]" />
                </a>
              </div>
              {/* BEGIN: Breadcrumb */}
            
              {/* <Breadcrumb light className="flex-1 hidden xl:block">
                <Breadcrumb.Link to="/">App</Breadcrumb.Link>
                <Breadcrumb.Link to="/">Inicio</Breadcrumb.Link>
                <Breadcrumb.Link to="/" active={true}>
                  Alumnos
                </Breadcrumb.Link>
              </Breadcrumb> */}
              {/* END: Breadcrumb */}
              {/* BEGIN: Search */}
              {/* <div
                className="relative justify-center flex-1 hidden xl:flex"
                onClick={() => setQuickSearch(true)}
              >
                <div className="bg-white/[0.12] border-transparent border w-[350px] flex items-center py-2 px-3.5 rounded-[0.5rem] text-white/60 cursor-pointer hover:bg-white/[0.15] transition-colors duration-300 hover:duration-100">
                  <Lucide icon="Search" className="w-[18px] h-[18px]" />
                  <div className="ml-2.5 mr-auto">Búsqueda rápida...</div>
                  <div>⌘K</div>
                </div>
              </div>
              <QuickSearch
                quickSearch={quickSearch}
                setQuickSearch={setQuickSearch}
              /> */}
              {/* END: Search */}
              {/* BEGIN: Notification & User Menu */}
              <div className="flex items-center flex-1">
                <div className="flex items-center gap-1 ml-auto">
                  {/* <a
                    href=""
                    className="p-2 text-white rounded-full hover:bg-white/5"
                    onClick={(e) => {
                      e.preventDefault();
                      setActivitiesPanel(true);
                    }}
                  >
                    <Lucide icon="LayoutGrid" className="w-[18px] h-[18px]" />
                  </a> */}
                  {/* <a
                    href=""
                    className="p-2 text-white rounded-full hover:bg-white/5"
                  >
                    <Lucide icon="Moon" className="w-[18px] h-[18px]" />
                  </a> */}
                  <a
                    href=""
                    className="p-2 text-white rounded-full hover:bg-white/5"
                    onClick={(e) => {
                      e.preventDefault();
                      requestFullscreen();
                    }}
                  >
                    <Lucide icon="Expand" className="w-[18px] h-[18px]" />
                  </a>
                  <a
                    href=""
                    className="p-2 text-white rounded-full hover:bg-white/5"
                    onClick={(e) => {
                      e.preventDefault();
                      setNotificationsPanel(true);
                    }}
                  >
                    <Lucide icon="Bell" className="w-[18px] h-[18px]" />
                  </a>
                </div>
                <Menu className="ml-5">
                  <Menu.Button className="overflow-hidden rounded-full w-[36px] h-[36px] border-[3px] border-white/[0.15] image-fit">
                    <img
                      alt="Photo"
                      src={`https://ui-avatars.com/api/?background=F3D55B&color=AE5EAB&name=Ms`}
                    />
                    {/* <img
                      alt="Photo"
                      src={`https://ui-avatars.com/api/?background=07bc0c&color=fff&name=${email.slice(
                        0,
                        2
                      )}`}
                    /> */}
                  </Menu.Button>
                  <Menu.Items className="w-56 mt-1">
                    {/*  <Menu.Item
                      onClick={() => {
                        setSwitchAccount(true);
                      }}
                    >
                      <Lucide icon="ToggleLeft" className="w-4 h-4 mr-2" />
                      Switch Account
                    </Menu.Item>
                    <Menu.Divider />
                   <Menu.Item
                      onClick={() => {
                        navigate("settings?page=connected-services");
                      }}
                    >
                      <Lucide icon="Settings" className="w-4 h-4 mr-2" />
                      Connected Services
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        navigate("settings?page=email-settings");
                      }}
                    >
                      <Lucide icon="Inbox" className="w-4 h-4 mr-2" />
                      Email Settings
                    </Menu.Item> */}
                    <Menu.Item
                      onClick={() => {
                        navigate("settings?page=security");
                      }}
                    >
                      <Lucide icon="Lock" className="w-4 h-4 mr-2" />
                      Cambiar Clave
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      onClick={() => {
                        navigate("settings");
                      }}
                    >
                      <Lucide icon="Users" className="w-4 h-4 mr-2" />
                      Mi Perfil
                    </Menu.Item>
                    <Menu.Item
                      onClick={async() => {
                        await signOut()
                        navigate("auth");
                      }}
                    >
                      <Lucide icon="Power" className="w-4 h-4 mr-2" />
                      Salir
                    </Menu.Item>
                  </Menu.Items>
                </Menu>
              </div>
              <ActivitiesPanel
                activitiesPanel={activitiesPanel}
                setActivitiesPanel={setActivitiesPanel}
              />
              <NotificationsPanel
                notificationsPanel={notificationsPanel}
                setNotificationsPanel={setNotificationsPanel}
              />
              <SwitchAccount
                switchAccount={switchAccount}
                setSwitchAccount={setSwitchAccount}
              />
              {/* END: Notification & User Menu */}
            </div>
          </div>
        </div>
      </div>
      <div
        className={clsx([
          "transition-[margin,width] duration-100 xl:pl-3.5 pt-[54px] pb-16 relative z-10 group mode",
          { "xl:ml-[275px]": !compactMenu },
          { "xl:ml-[91px]": compactMenu },
          { "mode--light": !topBarActive },
        ])}
      >
        <div className="px-5 mt-16">
          <div className="container">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Main;
