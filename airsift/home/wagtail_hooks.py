from wagtail.core import hooks

'''
Make 'publish' the default action in the editor UI.
Thanks to https://www.yellowduck.be/posts/making-publish-default-action-wagtail/
'''
@hooks.register('construct_page_action_menu')
def make_publish_default_action(menu_items, request, context):
    try:
        for (index, item) in enumerate(menu_items):
            if item.name == 'action-publish':
                menu_items.pop(index)
                menu_items.insert(0, item)
                break
    except:
        pass
