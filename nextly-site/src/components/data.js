import {
  FaceSmileIcon,
  ChartBarSquareIcon,
  CursorArrowRaysIcon,
  DevicePhoneMobileIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
} from "@heroicons/react/24/solid";

import benefitOneImg from "../../public/img/benefit-one.png";
import benefitTwoImg from "../../public/img/benefit-two.png";

const benefitOne = {
  title: "Why homeowners call us first",
  desc: "Window Maintenance fixes aluminium windows and sliders across the Wellington region. Same‑day replies, tidy workmanship and fair pricing.",
  image: benefitOneImg,
  bullets: [
    {
      title: "Smooth sliding doors",
      desc: "Rollers replaced, tracks resurfaced and panels re‑aligned.",
      icon: <FaceSmileIcon />,
    },
    {
      title: "Drafts & leaks fixed",
      desc: "New wedges/seals and sash alignment for quiet, dry rooms.",
      icon: <ChartBarSquareIcon />,
    },
    {
      title: "Secure hardware",
      desc: "Stays, hinges, handles and locks serviced or replaced.",
      icon: <CursorArrowRaysIcon />,
    },
  ],
};

const benefitTwo = {
  title: "Local specialists for aluminium joinery",
  desc: "From storm‑bent awning stays to worn ranchslider rollers, we keep Wellington’s windows and doors working like new.",
  image: benefitTwoImg,
  bullets: [
    {
      title: "Fast quotes",
      desc: "Send photos and we’ll usually reply the same day.",
      icon: <DevicePhoneMobileIcon />,
    },
    {
      title: "On‑van stock",
      desc: "Common rollers, wedges and hardware carried for quick fixes.",
      icon: <AdjustmentsHorizontalIcon />,
    },
    {
      title: "Tidy workmanship",
      desc: "We clean up, test and ensure doors and windows seal properly.",
      icon: <SunIcon />,
    },
  ],
};


export {benefitOne, benefitTwo};
