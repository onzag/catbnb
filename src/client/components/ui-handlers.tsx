import { IDrawerUIHandlerConfiguratorElement, ISlateTemplateUIHandlerProps, IToolbarPrescenseElement } from "@onzag/itemize/client/fast-prototyping/components/slate";
import { Button, ExtensionIcon } from "@onzag/itemize/client/fast-prototyping/mui-core";
import React from "react";

/**
 * This is the button ui handler itself
 * @param props the props are based on ISlateTemplateUIHandlerProps which extends
 * the IUIHandlerProps which allows you to create an edit mode for the button so this same
 * component can be used for both display mode and edit mode, you can technically use different
 * components for display and edit, and it's up to the editor what extra props to pass, the slate
 * edit ui handler manager was built so that it keeps compatibility with the text serializer
 */
export const button = (props: ISlateTemplateUIHandlerProps) => {
  // as you can see we just render a button
  return (
    <Button
      // these come from the arguments our template handler supports
      variant={props.args.type}
      color={props.args.color}
      // these come from the rich classes
      className={props.className}
      // we need to change the style if we are in slate to use a cursor text
      // note how we extend props.style this is because these are the styles given
      // by the configuration of the inline style, there is also styleActive and styleHover
      // but we are ignoring them
      style={props.isSlate ? { ...props.style, cursor: "text" } : props.style}
      // we need to change the touch ripple props if we are in slate because
      // we are inside a content editable then
      TouchRippleProps={props.isSlate ? {
        contentEditable: false,
        style: {
          userSelect: "none",
        }
      } : null}
      // the events are what events have been added to the component
      // in the standard functions given in the context, so data-on-click
      // becomes onClick and provides a function and so on
      {...props.events}
      // these are attributes from slate given by the renderer if we
      // are in such mode
      {...props.attributes}
    >
      {props.children}
    </Button>
  );
}

/**
 * This is very specific to our fast prototyping editor, unlike our handler
 * which is compatible with our text serializer, it represents a button in the toolbar
 * that inserts a node, in our case, we want to add a button, and we are basing
 * ourselves off a paragraph for that, since that's the behaviour we want, if you need
 * to support children, it could be, for example, a container
 */
export const buttonToolbarPrescence: IToolbarPrescenseElement = {
  element: {
    type: "paragraph",
    containment: "block",
    children: [],
    uiHandler: "button",
    uiHandlerArgs: {
      type: "contained",
      color: "primary",
    },
    givenName: "button",
  },
  icon: <ExtensionIcon />,
}

/**
 * These are also very specific to the fast prototyping editor, and represents
 * extra options to add to the general configuration drawer for the element, so if you
 * remember the uiHandler args we have two, type and color, this allows the drawer to modify
 * these args, if you use other editor other than the fast prototyping this might differ, however
 * we encourage other editors to still support these basic options
 */
export const buttonOptions: IDrawerUIHandlerConfiguratorElement[] = [
  {
    uiHandler: "button",
    arg: "type",
    input: {
      type: "select",
      label: "button type",
      placeholder: "button type",
      options: [
        {
          label: "contained",
          value: "contained",
        },
        {
          label: "text",
          value: "text",
        },
        {
          label: "outlined",
          value: "outlined",
        }
      ],
    }
  },
  {
    uiHandler: "button",
    arg: "color",
    input: {
      type: "select",
      label: "button color",
      placeholder: "button color",
      options: [
        {
          label: "primary",
          value: "primary",
        },
        {
          label: "secondary",
          value: "secondary",
        }
      ],
    }
  }
];
