import {FlashStackParamList} from '../../../screens/Flash';
import {Flash} from '../../../redux/flashes';
import {FlashesWithUser} from '../../flashes/ShowFlash';

// flashそのもの
type Flashそのもの = Flash;

// 実際に一つのflashを表示するときにShowFlashで表示される型
type 実際に一つのflashを表示するときにShowFlashで要求されるflashの型 = FlashesWithUser;

// Flashesをレンダリングするときにスクリーンから要求されるtype
type Flashを表示するときにスクリーンから要求される型 = FlashStackParamList;
